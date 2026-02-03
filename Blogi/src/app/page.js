"use client"
import Image from "next/image";
import { Header, Footer, Category } from "@/app/components/index";
import { defaultArticle, defaultAvatar } from './components/images'
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";


export default function Home() {

    const [mostPopularArticle, setMostPopularArticle] = useState(null)
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchArticles = async () => {
      setLoading(false)

      const {data, error} = await supabase
        .from("article")
        .select(
          `
            id, title, content, thumbnail, date_created, views, read_time, slug,
            category: category_id(title),
            author: profile_id(full_name, image, job_title)
          `,
          {count: "exact"}
        )
        .order("date_created", {ascending: false})
      
      if (error) {
        console.log("Virhe Blogi viestien hakemisessa: ",error);
      } else {
        setArticles(data)
      }

      setLoading(false)
    }

    useEffect(() => {
      fetchArticles()
    }, [])

    useEffect(() => {
      if (!articles?.length) return

      const popularArticle = articles?.reduce((max, article) => (article.views > max.views ? article : max), articles[0])
      setMostPopularArticle(popularArticle)
    }, [articles])

    return (
      <>
        <Header />
        <section className="grid lg:grid-cols-2 grid-cols-1 gap-7 px-5 lg:px-33 py-5 my-20">
          <div className="relative h-[40rem]">
            <Image width={100} height={100} src={mostPopularArticle?.thumbnail || defaultArticle} alt="Image Title" className="w-full h-full object-cover rounded-xl absolute" />
            <div className="absolute bg-[#0b021bdb] w-full bottom-0 backdrop-blur-md rounded-xl p-3 space-y-3">
              <div className="inline-flex items-center gap-2 bg-indigo-500 p-1 w-auto text-xs me-2 rounded-full">
                <i className="fas fa-umbrella"></i>
                <p>{mostPopularArticle?.category?.title}</p>
              </div>
              <h1 className="text-3xl font-bold drop-shadow-lg">{mostPopularArticle?.title}</h1>
              <div className="flex items-center gap-4 font-semibold">
                <Image width={100} height={100} src={mostPopularArticle?.author?.image || defaultAvatar} alt="Image Avatar" className="w-8 h-8 object-cover rounded-full" />
                <p>{formatDate(mostPopularArticle?.date_created)}</p>
                <p>.</p>
                <p>{mostPopularArticle?.read_time} Min Luettu</p>
              </div>
            </div>
          </div>
          
        </section>
        <section className="p-5">
          <Category />
        </section>
        <section className="lg:px-33 px-5 lg:my-30 my-10">
          <div>
            <h1 className="lx:text-7xl text-4xl font-bold" onClick={fetchArticles}>Luetuimmat Viestit 🔥</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-7 mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 h-fit">
              {articles?.slice(0, 4)?.map((article, index) => (
                <div key={article.id} className="border-2 border-[#2016736e] bg-[#0d0837] rounded-xl p-2 shadow-lg h-auto">
                <Image width={100} height={100} src={article.thumbnail} alt="Esimerkki blogi postauksen Otsikko" className="w-full h-[20rem] object-cover rounded-xl" />
                {/* Post card body */}
                <div className="space-y-3 pt-5">
                  <div className="inline-flex items-center gap-2 bg-indigo-500 p-1 w-auto text-xs me-2 rounded-full">
                    <i className="fas fa-umbrella"></i>
                    <p>{article?.category?.title}</p>
                  </div>
                  <h1 className="text-2xl font-bold drop-shadow-lg">{article?.title}</h1>
                  <div className="flex items-center gap-5 text-xs text-gray-300 font-light">
                    <div className="flex gap-1 items-center">
                      <i className="fas fa-eye"></i>
                      <p className="font-bold mb-0">{article?.views} Nähty</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <i className="fas fa-clock"></i>
                      <p className="font-bold mb-0">{article?.read_time} Min Luettu</p>
                    </div>
                  </div>
                </div>
                {/* Post card footer */}
                <div className="flex items-center justify-between gap-4 font-semibold bg-indigo-900 p-2 rounded-xl mt-6">
                  <div className="flex items-center gap-2">
                    <Image width={100} height={100} src={article?.author?.image || defaultAvatar} alt="Esimerkki postauksen kirjoittajan kuva" className="w-8 h-8 object-cover rounded-full" />
                    <div>
                      <h1 className="text-sm text-white font-bold mb-0">{article?.author?.full_name}</h1>
                      <p className="text-xs font-light text-gray-100 italic mt-0">{article?.author?.job_title }</p>
                    </div>
                  </div>
                  <Link href={`/${article?.slug}`} className="bg-indigo-400 text-[12px] font-bold px-4 py-2 rounded-xl border border-[#a4adff]">
                    <i className="fas fa-arrow-right text-indigo-950"></i>
                  </Link>
                </div>
              </div>
              ))}
            </div>
            <div>
              
              <div>
                <div className="my-10">
                  <h1 className="text-2xl font-bold">Uusin Blogi Viesti 📰</h1>
                  <p className="italic font-normal text-xs mt-2 text-gray-500">Viimeisimmät uudet Viestit jotka olet päivittänyt.</p>
                </div>
                {articles?.slice(0, 2).map((article, index) => (
                  <div key={article.id} className="mb-4 flex gap-2 border border-[#9498ff34] p-2 rounded-xl">
                    <Image width={100} height={100} src={article?.thumbnail} alt="" className="h-20 w-20 object-cover rounded-md" />
                    <div className="flex flex-col justify-between">
                      <h1 className="text-bold">{article?.title}</h1>
                      <div className="flex items-center gap-4 font-light text-xs">
                        <p>{article?.author?.full_name}</p>
                        <p>{article?.read_time} Min Luettu</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
}
