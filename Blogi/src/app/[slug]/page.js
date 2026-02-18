"use client"

import { useState, useEffect, useRef } from 'react'
import { Header, Footer, Category } from '../components'
import Image from 'next/image'
import { defaultArticle, defaultAvatar } from '../components/images'
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'



export default function Page() {
  const params = useParams();
  const slug = params.slug;
  const { user } = useAuth()

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estää tuplafetchin Strict Modessa
  const fetchedRef = useRef(false);


  useEffect(() => {
  if (fetchedRef.current) return;
  fetchedRef.current = true;

  const fetchArticleData = async () => {
     setLoading(true);

    const { data: articleData, error: articleError } = await supabase
      .from("article")
      .select(`
        id, title, content, thumbnail, date_created, views, read_time, slug,
        categories:article_category(
          category:category_id(
            id,
            title,
            slug
          )
        ),
        author: profile_id(id, full_name, image, job_title)
      `)
      .eq("slug", slug)
      .single();

    if (articleError) {
      toast.error("Blogi viestin hakeminen epäonnistui");
      console.error(articleError);
      setLoading(false);
      return;
    }

    // Päivitä views tietokantaan (vain kerran)
    await supabase.rpc("increment_article_view", { article_id: articleData.id });

    // EI lisätä UI:ssa enää mitään → ei tuplaa
    // articleData.views += 1;  <-- poistettu

    setArticle(articleData);
    setLoading(false);
  };

  fetchArticleData();
}, [slug]);



  const categoryIcons = {
    Ohjelmointi: "fas fa-microchip",
    Lifestyle: "fas fa-leaf",
    Travel: "fas fa-plane",
    Food: "fas fa-utensils",
    Business: "fas fa-briefcase",
    Gaming: "fas fa-gamepad",
    Health: "fas fa-heartbeat",
  };

  const categoryColors = {
    Ohjelmointi: "bg-blue-500",
    Lifestyle: "bg-green-500",
    Travel: "bg-orange-500",
    Food: "bg-red-500",
    Business: "bg-gray-700",
    Gaming: "bg-purple-600",
    Health: "bg-pink-500",
  };

  return (
    <div>
      <Header />
        
      <section className="lg:px-33 px-5 my-20 z-10 relative">
        <div className="relative w-full h-[30rem]">
          <Image
            src={article?.thumbnail || defaultArticle}
            alt=""
            fill
            priority
            className="object-cover absolute rounded-2xl"
          />
          <div className="w-full h-[30rem] absolute bg-[#000000c3] rounded-2xl" />
          <h1 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center text-5xl font-semibold leading-[4rem] drop-shadow-lg">
            {article?.title}
          </h1>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          {article?.categories?.map((c) => (
            <div
              key={c.category.id}
              className={`inline-flex items-center gap-2 p-1 w-auto text-xs rounded-full ${
                categoryColors[c.category.title] || "bg-indigo-500"
              }`}
            >
              <i className={categoryIcons[c.category.title] || "fas fa-tag"}></i>
              <p>{c.category.title}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-10">
        {article && user && (
  <Link
      href={`/dashboard/article/edit/${article.slug}`}
      className="p-2 px-4 bg-indigo-600 rounded-lg"
  >
      <i className="fas fa-edit me-1"></i> Muokkaa
  </Link>
)}

          <div className="p-2 px-4 bg-indigo-800 rounded-lg">
            <i className="fas fa-eye me-1"></i>
            {article?.views} Nähnyt
          </div>

          <div className="p-2 px-4 bg-indigo-800 rounded-lg">
            <i className="fas fa-clock me-1"></i>
            {article?.read_time} min luettu
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-10 my-10">
          <div>
            <div className="bg-[#07050dd3] p-4 rounded-3xl backdrop-blur-sm">
              <article
                className="mb-2"
                dangerouslySetInnerHTML={{ __html: article?.content }}
              />
            </div>

            <div className="space-y-8 mt-10">
              <div className="flex items-center gap-3 bg-indigo-800 rounded-xl p-3 relative">
                <Image
                  width={100}
                  height={100}
                  src={article?.author?.image || defaultAvatar}
                  alt=""
                  className="w-[5rem] h-[5rem] rounded-full"
                />
                <div>
                  <h1 className="text-3xl font-bold">{article?.author?.full_name}</h1>
                  <p className="text-gray-300 italic">{article?.author?.job_title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

