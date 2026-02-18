"use client"
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { defaultArticle } from '../components/images'
import { supabase } from '@/lib/supabaseClient'

const Category = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('category')   // taulun nimi Supabasessa
        .select('id, title, slug')

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
    return <p>Ladataan kategorioita...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Kategoriat 🌟</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 justify-between mt-10">
          {categories?.map((category) => (
            
              <div className="w-full h-[5rem] relative">
                <div className="w-full h-[5rem] bg-[#0b0011cc] absolute rounded-lg" />
                <h1 className="text-xl font-semibold absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center text-white">
                  {category?.title}
                </h1>
              </div>
          ))}
        </div>
    </div>
  )
}

export default Category

