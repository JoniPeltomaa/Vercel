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

    useEffect(() => {
      const fetchArticles = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("article")
        .select(
          `
            id, title, content, thumbnail, date_created, views, read_time, slug,
            categories:article_category(
              category:category_id(
                id,
                title,
                slug
              )
            ),
            author:profile_id(full_name, image, job_title)
          `,
          { count: "exact" }
        )
        .order("date_created", { ascending: false });

      if (error) {
        console.log("Virhe Blogi viestien hakemisessa: ", error);
      } else {
        setArticles(data);
      }

      setLoading(false);
    };

      fetchArticles()
    }, [])

    useEffect(() => {
      if (!articles?.length) return

      const popularArticle = articles?.reduce((max, article) => (article.views > max.views ? article : max), articles[0])
      setMostPopularArticle(popularArticle)
    }, [articles])

    const categoryIcons = {
      Ohjelmointi: "fas fa-code",
      React: "fab fa-react",
      Bootstrap: "fab fa-bootstrap",
      Ruoka: "fas fa-utensils",
      Nextjs: "fas fa-code",
      Tailwind: "fab fa-tailwind-css",
      JavaScript: "fab fa-js",
      Nodejs: "fab fa-node-js",
      Npm: "fab fa-npm",
      Tietoliikenne: "fas fa-network-wired",
    };


    return (
      <>
        <Header />
        <section className="p-5">
          <Category />
        </section>
        <section className="lg:px-33 px-5 lg:my-30 my-10">
          <div>
            <h1 className="lx:text-7xl text-4xl font-bold">Viestit 🔥</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-7 mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 h-fit">
              {articles?.slice(0, 4)?.map((article) => (
                <div
                  key={article.id}
                  className="border-2 border-[#2016736e] bg-[#0d0837] rounded-xl p-2 shadow-lg h-auto flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-[20rem]">
                    <Image
                      src={article.thumbnail}
                      alt={article.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  {/* Post card body */}
                  <div className="space-y-3 pt-5 pb-6">
                    {/* Categories */}
                    <div className="flex gap-2 flex-wrap">
                      {article?.categories?.map((c) => (
                        <div
                          key={c.category.id}
                          className="inline-flex items-center gap-2 bg-indigo-500 p-2 w-auto text-xs me-2 rounded-full"
                        >
                          <i className={`${categoryIcons[c.category.title] || "fas fa-tag "} text-xl`}></i>
                          <p className="">{c.category.title}</p>
                        </div>
                      ))}
                    </div>
                    <h1 className="text-2xl font-bold drop-shadow-lg">
                      {article?.title}
                    </h1>
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
                  <div className="flex items-center justify-between gap-4 font-semibold bg-indigo-900 p-2 rounded-xl mt-auto ">
                    <div className="flex items-center gap-2 ">
                      <Image
                        width={100}
                        height={100}
                        src={article?.author?.image || defaultAvatar}
                        alt="Kirjoittaja"
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{article?.author?.full_name}</h1>
                      <p className="text-gray-300 italic">{article?.author?.job_title}</p>
                    </div>
                    <Link
                      href={`/${article?.slug}`}
                      className="bg-indigo-400 text-[12px] font-bold px-4 py-2 rounded-xl border border-[#a4adff]"
                    >
                      <i className="fas fa-arrow-right text-indigo-950"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
}
