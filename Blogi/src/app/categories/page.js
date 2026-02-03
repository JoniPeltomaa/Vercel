"use client"
import React, { useState, useEffect } from 'react'
import { Header, Footer } from '../components'
import { defaultArticle } from '../components/images'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Page() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('category')   // taulun nimi Supabasessa
        .select('id, title, thumbnail, slug')

      if (error) {
        console.error('Virhe kategorioiden haussa:', error)
      } else {
        setCategories(data || [])
      }
      setLoading(false)
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div>
        <Header />
        <p className="px-5 mt-10">Ladataan kategorioita...</p>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <section className="lg:px-33 px-5 lg:my-30 my-10">
        <div className="mb-10 relative">
          <h1 className="lg:text-7xl text-4xl font-bold">Kategoria</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 justify-between mt-10">
          {categories?.map((category) => (
            <Link key={category?.id} href={`/categories/${category?.slug}`} className="block">
              <div className="w-full h-[5rem] relative cursor-pointer">
                <Image
                  width={100}
                  height={100}
                  src={category?.thumbnail || defaultArticle}
                  alt={`Kategoria: ${category?.title}`}
                  className="w-full h-[5rem] object-cover absolute rounded-lg"
                />
                <div className="w-full h-[5rem] bg-[#0b0011cc] absolute rounded-lg" />
                <h1 className="text-xl font-semibold absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center text-white">
                  {category?.title}
                </h1>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}

