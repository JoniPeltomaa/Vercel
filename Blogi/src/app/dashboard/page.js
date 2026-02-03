"use client"
import React, { useEffect, useState } from 'react'
import { Header, Footer } from '../components'
import { defaultArticle, defaultAvatar } from '../components/images'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function Page() {
  
    const { loading, profile } = useAuth();
    const [stats, setStats] = useState([]);
    const [articles, setArticles] = useState([]);
    const [comments, setComments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);

    const fetchDashboardData = async () => {
        if (!profile?.id) return
        setLoadingDashboardStats(true)

        const { data: articles, error: articleError } = await supabase
            .from("article")
            .select(
                `
                    id, title, content, thumbnail, date_created, views, read_time,slug,
                    category:category_id (title),
                    author:profile_id(full_name, id, image, job_title),
                    comment(id, comment, date_created, profile:profile_id(full_name, image)),
                    like(id, profile_id, date_created)
                `
            )
            .eq("profile_id", profile?.id)
            .order("date_created", {ascending: false })
        
        if (articleError) {
            toast.error("Virhe haettaessa artikkeleita")
            console.log("Error fetching articles", articleError)
            setLoadingDashboardStats(false)
            return
        }

        const articleIds = articles?.map((article) => article?.id)

        const [
            {data:likes, error:likesError},
            {data:comments, error:commentsError},
            {data:notifications, error:notificationsError},
        ] = await Promise.all([
            supabase.from("like").select("id").in("article_id", articleIds),

            supabase
                .from("comment")
                .select("id, comment, date_created, profile:profile_id(full_name, image)")
                .in("article_id", articleIds)
                .order("date_created", {ascending: false}),
            
            supabase
                .from("notification")
                .select("id, message, type, date_created")
                .eq("receiver_id", profile?.id)
                .eq("is_read", false)
                .order("date_created", {ascending: false})
        ])

        if (likesError || commentsError || notificationsError) {
            toast.error("Virhe haettaessa artikkeleita")
            console.log("Error fetching articles", articleError)
            setLoadingDashboardStats(false)
            return
        }

        const statsArray = [
        { title: "Nähty", value: articles?.reduce((sum, a) => sum + a.views, 0), icon: "fas fa-eye", bg: "bg-orange-200", text: "text-orange-600" },
        { title: "Viestit", value: articles?.length, icon: "fas fa-file", bg: "bg-blue-200", text: "text-blue-600" },
        { title: "Tykkäykset", value: likes?.length, icon: "fas fa-heart", bg: "bg-red-200", text: "text-red-600" },
        { title: "Kommentit", value: comments?.length, icon: "fas fa-comment", bg: "bg-purple-200", text: "text-purple-600" },
        { title: "Ilmoitukset", value: notifications?.length, icon: "fas fa-bell", bg: "bg-yellow-200", text: "text-yellow-600" },
        ]

         console.log(statsArray)

        setArticles(articles)
        setComments(comments)
        setNotifications(notifications)
        setStats(statsArray)
        setLoadingDashboardStats(false)
    }

    const deletePost = async (postId) => {
        const { error } = await supabase.from("article").delete().eq("id", postId)

        if (error) {
            toast.error("Virhe Viestin poistamisessa")
            console.log("Error deleting post", error)
            return
        } else {
            toast.success("Viestin poistaminen onnistui")
            setArticles((prev) => prev.filter((article) => article.id !== postId))
        }
    }


    useEffect(() => {
        fetchDashboardData()
    }, [])
    


  return (
    <div>
        <Header />
        <section className="lg:px-33 px-5 my-20 space-y-10 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {stats?.map((stat, index) => (
                    <div className="p-5 rounded-lg flex items-center gap-6 bg-[#07050D] border border-[#110c1f]">
                        <i className={`${stat.icon} text-3xl p-3 rounded-lg ${stat?.bg} ${stat?.text}`}></i>
                        <div>
                            <h2 className="text-3xl font-bold">{stat?.value}</h2>
                            <p className="text-md text-gray-300">{stat?.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-lg bg-[#07050D] border border-[#110c1f] space-y-8" onClick={fetchDashboardData} >
                    <div className="space-y-1 mb-10">
                        <h2 className="text-3xl font-bold">Blogi Viestit</h2>
                        <p className="text-sm text-gary-300">Kaikki Viestit</p>
                    </div>
                    <div className="overflow-y-scroll max-h-[40rem]">
                        {articles?.map((article, index) => (
                            <div className="border border-[#110c1f] py-5 me-2">
                                <div className="flex gap-4 items-center">
                                    <Image width={100} height={100} src={article?.thumbnail} className="w-20 h-20 object-cover rounded-md" alt={article?.title} />
                                    <div className="space-y-2">
                                        <p className="text-md">{article?.title}</p>
                                        <div className="flex gap-4">
                                            <p className="text-xs text-gray-500">
                                                <i className="fas fa-calendar me-1"></i> {formatDate(article?.date_created)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                <i className="fas fa-eye me-1"></i> {article?.views}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                <i className="fas fa-thumbs-up me-1"></i> {article?.like?.length || 0}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                <i className="fas fa-comment me-1"></i> {article?.comment?.length ||0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-3">
                                    <Link href={`/${article?.slug}`} className="h-10 w-10 flex items-center justify-center bg-green-700 rounded-md">
                                        <i className="fas fa-eye"></i>
                                    </Link>
                                    <Link href={`/dashboard/article/manage?id=${article?.id}`} className="h-10 w-10 flex items-center justify-center bg-blue-700 rounded-md">
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <button onClick={() => deletePost(article?.id)} className="h-10 w-10 flex items-center justify-center bg-red-700 rounded-md">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-5 rounded-lg bg-[#07050D] border border-[#110c1f] space-y-8">
                    <div className="space-y-1 mb-10">
                        <h2 className="text-3xl font-bold">Kommentit</h2>
                        <p className="text-sm text-gary-300">Viimeisimmät Kommentit</p>
                    </div>
                    <div className="overflow-y-scroll max-h-[40rem]">
                        {comments?.map((comment, index) => (
                            <div className="flex gap-4 items-center border-b border-[#110c1f] py-5">
                                <Image width={100} height={100} src={comment?.profile?.image || defaultAvatar} className="w-10 h-10 object-cover rounded-full" alt="" />
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-200">{comment?.comment}</p>
                                    <p className="text-sm text-gray-500">{comment?.profile?.full_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-5 rounded-lg bg-[#07050D] border border-[#110c1f] space-y-8">
                    <div className="space-y-1 mb-10">
                        <h2 className="text-3xl font-bold">Ilmoitukset</h2>
                        <p className="text-sm text-gary-300">Lukematta Olevat Ilmoitukset</p>
                    </div>
                    <div className="overflow-y-scroll max-h-[40rem]">
                        {notifications?.map((notification, index) => (
                            <div className="flex items-center gap-6 border-b border-[#110c1f] py-5">
                                <i className={`fas ${notification?.type === "Kommentit" ? "fa-comment bg-purple-200 text-purple-600" : "fa-thumbs-up bg-blue-200 text-blue-600"} text-3xl p-3 rounded-lg`}></i>
                                <div className="space-x-2">
                                    <h2 className="text-2xl font-bold">{notification?.type?.charAt(0).toUpperCase() + notification.type.slice(1)}</h2>
                                    <p className="text-xs text-gray-500">{notification.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
        <Footer />
    </div>
  )
}
