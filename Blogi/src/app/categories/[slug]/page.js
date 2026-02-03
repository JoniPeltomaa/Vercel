"use client"
import React, { useState, useEffect } from 'react'
import { Header, Footer } from '@/app/components'
import { defaultArticle, defaultAvatar } from '@/app/components/images'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

export default function Page({ params }) {
  const { slug } = React.use(params)
  const [articles, setArticles] = useState([])
  const [categoryTitle, setCategoryTitle] = useState(slug)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)

      // Hae kategorian otsikko
      const { data: categoryData } = await supabase
        .from('category')
        .select('id, title')
        .eq('slug', slug)
        .single()

      if (categoryData) {
        setCategoryTitle(categoryData.title)
      }

      // Hae artikkelit kyseiselle kategorialle
      const { data, error } = await supabase
        .from('article')
        .select(`
          id,
          title,
          content,
          thumbnail,
          views,
          read_time,
          category ( title ),
          profile ( full_name, job_title, image )
        `)
        .eq('category_id', categoryData.id)

      if (error) {
        console.error('Virhe artikkeleiden haussa:', error)
      } else {
        setArticles(data || [])
      }
      setLoading(false)
    }

    fetchArticles()
  }, [slug])

  if (loading) {
    return (
      <div>
        <Header />
        <p className="px-5 mt-10">Ladataan artikkeleita...</p>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <section className="lg:px-33 px-5 lg:my-30 my-10">
        <div className="relative mb-20">
          <h1 className="lg:text-7xl text-4xl font-bold">
            {categoryTitle} ({articles.length})
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-7">
          {articles.slice(0, 4).map((article) => (
            <div
              key={article.id}
              className="border-2 border-[#2016736e] bg-[#0d0837] rounded-xl p-2 shadow-lg h-auto"
            >
              <Image
                width={100}
                height={100}
                src={article.thumbnail || defaultArticle}
                alt={article.title}
                className="w-full h-[20rem] object-cover rounded-xl"
              />
              {/* Post card body */}
              <div className="space-y-3 pt-5">
                <div className="inline-flex items-center gap-2 bg-indigo-500 p-1 w-auto text-xs me-2 rounded-full">
                  <i className="fas fa-umbrella"></i>
                  <p>{article.category?.title}</p>
                </div>
                <h1 className="text-2xl font-bold drop-shadow-lg">{article.title}</h1>
                <div className="flex items-center gap-5 text-xs text-gray-300 font-light">
                  <div className="flex gap-1 items-center">
                    <i className="fas fa-eye"></i>
                    <p className="font-bold mb-0">{article.views} Nähty</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <i className="fas fa-clock"></i>
                    <p className="font-bold mb-0">{article.read_time} Minuuttia Luettu</p>
                  </div>
                </div>
              </div>
              {/* Post card footer */}
              <div className="flex items-center justify-between gap-4 font-semibold bg-indigo-900 p-2 rounded-xl mt-6">
                <div className="flex items-center gap-2">
                  <Image
                    width={100}
                    height={100}
                    src={article.profile?.image || defaultAvatar}
                    alt={article.profile?.full_name}
                    className="w-8 h-8 object-cover rounded-full"
                  />
                  <div>
                    <h1 className="text-sm text-white font-bold mb-0">{article.profile?.full_name}</h1>
                  </div>
                </div>
                <Link
                  href={`/article/${article.id}`}
                  className="bg-indigo-400 text-[12px] font-bold px-4 py-2 rounded-xl border border-[#a4adff]"
                >
                  <i className="fas fa-arrow-right text-indigo-950"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}

