"use client"

import { useState, useEffect } from 'react'
import { Header, Footer, Category } from '../components'
import Image from 'next/image'
import { defaultArticle, defaultAvatar } from '../components/images'
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'


export default function Page() {

    const router = useRouter()
    const params = useParams()
    const slug = params.slug

    const { user, profile } = useAuth()

    const [article, setArticle] = useState([])
    const [comments, setComments] = useState([])
    const [likes, setLikes] = useState([])
    const [bookmarked, setBookmarked] = useState(false)
    const [loading, setLoading] = useState(true)

    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const [liking, setLiking] = useState(false)
    const [bookmarking, setBookmarking] = useState(false)

    const fetchArticleData = async () => {
        setLoading(false)

    const {data: articleData, error: articleError} = await supabase
        .from("article")
        .select(
            `
                id, title, content, thumbnail, date_created, views, read_time, slug,
                category: category_id(title),
                author: profile_id(id, full_name, image, job_title),
                comment(id, comment, date_created, profile: profile_id(full_name, image)),
                like(id, profile_id, date_created)
            `
        )
        .eq("slug", slug)
        .single()
        
        if (articleError) {
            toast.error("Blogi viestien hakeminen epäonnistuis")
            console.log("Blogi viestien hakeminen epäonnistuis: ", articleError)
            return
        }

        setArticle((prevArticle) => ({
            ...prevArticle,
            views: (prevArticle?.views || 0) + 1,
        }))

        const {error: updateError} = await supabase.from("article").update({views: articleData?.views + 1}).eq("id",articleData?.id)

        if (updateError) {
            console.log("Failed to update views: ", updateError)
        }

        setArticle(articleData)
        setComments(articleData?.comment)
        setLikes(articleData?.like)

        if (user) {
            const {data, bookmarkData, error: bookmarkError} = await supabase
            .from("bookmark")
            .select("id")
            .eq("profile_id", profile?.id)
            .eq("article_id", article?.id)
            .maybeSingle()

            if (bookmarkError) {
                console.error("Bookmark fecth error: ", bookmarkError)
            }

            setBookmarked(!!bookmarkData)
        }

        setLoading(false)
    }

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error("Comment is required")
            return
        }

        if (!user) {
            toast.error("Kirjaudu sisään lisätäksesi kommentin")
            return
        }

        setSubmitting(true)

        const {data, error} = await supabase
            .from("comment")
            .insert([
                {
                    article_id: article?.id,
                    profile_id: profile?.id,
                    comment: newComment,
                    date_created: new Date()
                }
            ])
            .select("id, comment, date_created, profile:profile_id(full_name, image)")
            .single()
        
        if (error) {
            toast.error("Ei onnistunut lisämään kommenttia")
            console.log("Comment insert error: ", error )
        }else {
            toast.success("Kommentti lisättiin onnistuneesti")
            setComments((prev) => [...prev, data])
            setNewComment("")
        }
        setSubmitting(false)
    }

    const handleLikeArticle = async () => {
        if (!user) {
            toast.error("Kirjaudu sisään tykätäksesi artikkelista")
            return
        }

        if (liking) return
        setLiking(true)

        const existingLike = likes.find((like) => like.profile_id === profile?.id)
        let updatedLikes

        if (existingLike) {
            updatedLikes = likes.filter((like) => like.profile_id !== profile?.id)
            setLikes(updatedLikes)

            const {error: unlikeError} = await supabase.from("like").delete().eq("id", existingLike?.id)

            if (unlikeError) {
                setLikes([...likes, existingLike])
                toast.error("epäonnistui poistamaan artikkelin tykkäyksen")
                console.error("unlike error: ", unlikeError)
            } else {
                toast.success("et enää tykännyt tästä artikkelista")
            }
        } else {
            const newLike = {
                id: Date.now(),
                profile_id: profile?.id,
                date_created: new Date().toISOString(),
            }

            updatedLikes = [...likes, newLike]
            setLikes(updatedLikes)

            const {data, error: likeError} = await supabase
                .from("like")
                .insert([
                    {
                        article_id: article?.id,
                        profile_id: profile?.id,
                        date_created: new Date(),
                    }
                ])
                .select("id")
                .single()
            
            if (likeError) {
                setLikes(likes.filter((like) => like.id !== newLike.id))
                toast.error("epäonnistui tykkäämästä artikkelista")
                console.error("Like error: ", likeError)
            } else {
                setLikes(updatedLikes?.map((like) => (like.id === newLike?.id ? { ...like, id: data.id} : like)))
                toast.success("Sinä tykkäsit tästä artikkelista")

                // Create a new notification object
                await supabase.from("notification").insert([
                    {
                        sender_id: profile?.id,
                        receiver_id: article?.author?.id,
                        type: "like",
                        message: `${profile?.full_name} tykkäsi sinun  artikkelista ${article?.title}`,
                        date_created: new Date(),
                        article_id: article?.id,
                    }
                ])
            }
        }

        setLiking(false)
    }

    const handleBookmark = async () => {
        if (!user) {
            toast.error("kirjaudu sisään tallentaaksesi tämä artikkeli kirjanmerkeihin")
            return
        }

        if (bookmarking) return

        setBookmarking(true)

        const {data: existingBookmark, error: fetchError} = await supabase
            .from("bookmark")
            .select("id")
            .eq("profile_id", profile?.id)
            .eq("article_id", article?.id)
            .single()

        if (fetchError && fetchError.code !== "PGRST116") {
            toast.error("virhe tarkistettaessa kirjanmerkkiä")
            console.error("Bookmark fetch error: ", fetchError)
            setBookmarking(false)
            return
        }

        if (existingBookmark) {
            const {error: removeError} = await supabase.from("bookmark").delete().eq("id", existingBookmark?.id)

            if (removeError) {
                toast.error("ei onnistunut poistamaan kirjanmerkkiä")
                console.error("Bookmark remove error: ", removeError)
            } else {
                setBookmarked(false)
                toast.success("Kirjainmerkki poistettu")
            }
        } else {
            const { error: insertError} = await supabase.from("bookmark").insert([
                {
                    profile_id: profile?.id,
                    article_id: article?.id,
                    date_created: new Date(),
                }
            ])
            if (insertError) {
                toast.error("ei onnistunut lisäämään artikkelia kirjanmerkkeihin")
                console.error("Bookmark error: ", insertError)
            } else {
                setBookmarked(true)
                toast.success("artikkeli merkitty kirjanmerkkeihin!")
            }
        }

        setBookmarking(false)
    }


    useEffect(() => {
        fetchArticleData()
    }, [])

  return (
    <div>
        <Header />
        <section className="lg:px-33 px-5 my-20 z-10 relative">
            <div className="relative w-full h-[30rem]"onClick={fetchArticleData}>
                <Image width={100} height={100} src={article?.thumbnail || defaultArticle} alt="" className=" w-full h-[30rem] object-cover absolute rounded-2xl" />
                <div className="w-full h-[30rem] absolute bg-[#000000c3] rounded-2xl" />
                <h1 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center text-5xl font-semibold leading-[4rem] drop-shadow-lg">{article?.title}</h1>
            </div>

            <div className="flex items-center gap-3 mt-10">
                <button onClick={handleLikeArticle} className="p-2 px-4 bg-indigo-800 rounded-lg"><i className="fas fa-thumbs-up"></i>{likes?.length || 0}</button>
                
                <button onClick={handleBookmark} className="p-2 px-4 bg-indigo-800 rounded-lg">
                    {bookmarking ? (<i className="fas fa-bookmark"></i>) : (<>
                        {bookmarked ? (<i className="fas fa-bookmark text-red-500"></i>) : (<i className="fas fa-bookmark"></i>)}
                    </>)}
                </button>
                
                <div className="p-2 px-4 bg-indigo-800 rounded-lg">
                    <i className="fas fa-eye me-1"></i>{article?.views} Nähnyt
                </div>
                
                <div className="p-2 px-4 bg-indigo-800 rounded-lg">
                    <i className="fas fa-clock me-1"></i>{article?.read_time} min luettu
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-10 my-10">
                <div >
                    <div className="bg-[#07050dd3] p-4 rounded-3xl backdrop-blur-sm ">
                        <p className="mb-2">{article?.content}</p>
                    </div>    
                    <div className="space-y-33 mt-10">
                        <div className="flex items-center gap-3 bg-indigo-800 rounded-xl p-3 relative">
                            <Image width={100} height={100} src={article?.author?.image || defaultAvatar} alt="" className="w-[5rem] h-[5rem] rounded-full" />
                            <div>
                                <h1 className="text-3xl font-bold">{article?.author?.full_name}</h1>
                            </div>
                        </div>
                        <div>
                            <h1 className="mb-5 text-2xl">Jätä Kommentit</h1>
                            <div className='space-y-5 relative'>
                                <div className='flex flex-col items-start gap-2'>
                                    <label htmlFor="">Koko Nimi</label>
                                    <input className='border-3 border-[#e1d1ff7a] p-2 rounded-lg w-full' type="text" value={profile?.full_name} readOnly placeholder="Sinun nimesi" />
                                </div>
                                <div className='flex flex-col items-start gap-2'>
                                    <label htmlFor="">Kommentit</label>
                                    <textarea className='border-3 border-[#e1d1ff7a] p-2 rounded-lg w-full' type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Kommentit" />
                                </div>
                                <div>
                                    <button onClick={handleAddComment} className="lg:flex bg-gradient-to-r from-indigo-500 to-pink-500 cursor-pointer text-[15px] font-bold px-6 py-3 rounded-full border-0 me-3">
                                        {submitting ? (
                                            <>
                                                Lähettää... <i className="fas fa-spinner fa-spin ms-1"></i>
                                            </>
                                        ) : (
                                            <>
                                                Lähetä Kommentit <i className="fas fa-paper-plane ms-1"></i>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='mt-10'>
                            <h1 className='text-2xl mb-5'>{comments?.length} Kommenttia</h1>
                            <div className='space-y-6'>
                                {comments?.map((comment, index) => (
                                    <div className='bg-[#07050D] border border-[#110c1f] p-5 rounded-xl' key={comment?.id}>
                                        <div className='flex items-center gap-3'>
                                            <Image width={100} height={100} src={comment?.profile.image || defaultAvatar} alt='' className='w-[2rem] h-[2rem] rounded-full' />
                                            <div>
                                                <h1 className='text-lg font-bold'>{comment?.profile.full_name}</h1>
                                                <p className='text-xs'>{formatDate(comment?.date_created)}</p>
                                            </div>
                                        </div>
                                        <p className='text-sm mt-3 text-gray-500'>{comment?.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Category />
            </div>
        </section>
        <Footer />
    </div>
  )
}
