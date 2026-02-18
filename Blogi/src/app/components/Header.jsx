"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { defaultArticle } from './images'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const Header = () => {
   const { user } = useAuth()
   const [loading, setLoading] = useState(false)
   const router = useRouter()

   const handleLogout = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error(error.message)
        toast.error("Kirjautuminen Ulos Epä onnnistui")
        setLoading(false)
        return
      }
      toast.success("Kirjautuminen Ulos Onnistui")
      router.push("/auth/login")
    } catch (error) {
      console.log(error);
      toast.error("Jokin meni väärin")
      setLoading(false)
      
    }
   }
  return (
    <div>
      <header className="flex flex-row justify-between items-center bg-indigo-800 my-5 mx-5 lg:mx-33 px-2 py-4 rounded-full">
        <Link href="/">
          <h1 className="text-2xl lg:text-3xl font-bold ms-3">Jonin Blogi</h1>
        </Link>
        <Menubar className={"text-white bg-[#0000] border-0 shadow-none hidden lg:flex"}>
          <MenubarMenu>
            <MenubarTrigger><Link href="/">Etusivu</Link></MenubarTrigger>
          </MenubarMenu>
          {user && (
            <MenubarMenu>
              <MenubarTrigger>Dashboard</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                <Link href="/dashboard">Yhteenveto</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/dashboard/article/manage">Luo Blogi Viesti</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/dashboard/profile">Muokkaa Profiilia</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          )}
        </Menubar>
        <div className="flex gap-4 items-center">
          {user ? (
            <button onClick={handleLogout} disabled={loading} className="hidden lg:flex items-center bg-gradient-to-r from-indigo-500 to-pink-500 cursor-pointer text-[15px] font-bold px-6 py-3 rounded-full border-0 me-3">{loading ? (
              <>
                 Kirjaudutaan Ulos <i className="fas fa-spinner fa-spin me-1"></i>
              </>
            ) : (
              <>
                <i className="fas fa-sign-out-alt me-1"></i> Kirjaudu Ulos 
              </>
            )}</button>
          ) : (
            <Link href="/auth/login" className="hidden lg:flex items-center bg-gradient-to-r from-indigo-500 to-pink-500 cursor-pointer text-[15px] font-bold px-6 py-3 rounded-full border-0 me-3">Kirjaudu Sisään <i className="fas fa-sign-in-alt ms-1"></i></Link>
          )}
        </div>
      </header>
    </div>
  )
}

export default Header