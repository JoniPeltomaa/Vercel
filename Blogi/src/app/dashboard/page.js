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
    const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);


    const deletePost = async (postId) => {
        // 1. Hae artikkeli, jotta saadaan thumbnail
        const { data: article, error: fetchError } = await supabase
            .from("article")
            .select("thumbnail")
            .eq("id", postId)
            .single();

        if (fetchError) {
            toast.error("Virhe haettaessa viestiä poistamista varten");
            console.log(fetchError);
            return;
        }

        // 2. Muunna thumbnail URL storage-poluksi
        const getStoragePath = (url) => {
            if (!url) return null;
            const parts = url.split("/object/public/");
            return parts[1] || null;
        };

        const storagePath = getStoragePath(article.thumbnail);

        // 3. Poista kuva Supabase Storagesta
        if (storagePath) {
            const { error: storageError } = await supabase.storage
            .from("blog-bucket") // ← bucketin nimi
            .remove([storagePath.replace("blog-bucket/", "")]);

            if (storageError) {
            console.log("Kuvan poistovirhe:", storageError);
            }
        }

        // 4. Poista kategoriat pivot-taulusta
        await supabase
            .from("article_category")
            .delete()
            .eq("article_id", postId);

        // 5. Poista itse artikkeli
        const { error } = await supabase
            .from("article")
            .delete()
            .eq("id", postId);

        if (error) {
            toast.error("Virhe Viestin poistamisessa");
            console.log("Error deleting post", error);
            return;
        }

        toast.success("Viestin poistaminen onnistui");

        // 6. Poista artikkeli UI:sta
        setArticles((prev) => prev.filter((article) => article.id !== postId));
    };

    useEffect(() => {
  if (!profile?.id) return;

  const fetchData = async () => {
    setLoadingDashboardStats(true);

    const { data: articles, error } = await supabase
      .from("article")
      .select(`
        id,
        title,
        content,
        thumbnail,
        date_created,
        views,
        read_time,
        slug,
        article_category (
          category_id (
            id,
            title,
            slug
          )
        ),
        author:profile_id (
          full_name,
          id,
          image,
          job_title
        )
      `)
      .eq("profile_id", profile.id)
      .order("date_created", { ascending: false });

    if (error) {
      toast.error("Virhe haettaessa artikkeleita");
      setLoadingDashboardStats(false);
      return;
    }

    const statsArray = [
      { title: "Nähty", value: articles.reduce((sum, a) => sum + (a.views ?? 0), 0), icon: "fas fa-eye", bg: "bg-orange-200", text: "text-orange-600" },
      { title: "Viestit", value: articles.length, icon: "fas fa-file", bg: "bg-blue-200", text: "text-blue-600" },
    ];

    setArticles(articles);
    setStats(statsArray);
    setLoadingDashboardStats(false);
  };

  fetchData();
}, [profile?.id]);



  return (
    <div>
        <Header />
        <section className="lg:px-33 px-5 my-20 space-y-10 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {stats?.map((stat, index) => (
                    <div key={index} className="p-5 rounded-lg flex items-center gap-6 bg-[#07050D] border border-[#110c1f]">
                        <i className={`${stat.icon} text-3xl p-3 rounded-lg ${stat.bg} ${stat.text}`}></i>
                        <div>
                            <h2 className="text-3xl font-bold">{stat.value}</h2>
                            <p className="text-md text-gray-300">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-lg bg-[#07050D] border border-[#110c1f] space-y-8">
                    <div className="space-y-1 mb-10">
                        <h2 className="text-3xl font-bold">Blogi Viestit</h2>
                        <p className="text-sm text-gary-300">Kaikki Viestit</p>
                    </div>
                    <div className="overflow-y-scroll max-h-[40rem]">
                        {articles?.map((article, index) => (
                            <div key={article.id} className="border border-[#110c1f] py-5 me-2">
                                <div className="flex gap-4 items-center">
                                    <Image width={100} height={100} src={article?.thumbnail || "/assets/images/default/defaultArticle.png"} className="w-20 h-20 object-cover rounded-md" alt={article?.title} />
                                    <div className="space-y-2">
                                        <p className="text-md">{article?.title}</p>
                                        <div className="flex gap-4">
                                            <p className="text-xs text-gray-500">
                                                <i className="fas fa-calendar me-1"></i> {formatDate(article?.date_created)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                <i className="fas fa-eye me-1"></i> {article?.views}
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
            </div>
        </section>
        <Footer />
    </div>
  )
}
