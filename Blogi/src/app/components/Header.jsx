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
          <MenubarMenu>
            <MenubarTrigger><Link href="/categories">Kategoria</Link></MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Dashboard</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link href="/dashboard">Yhteenveto</Link>
              </MenubarItem>
              <MenubarItem>
                <Link href="/dashboard/article/manage">Luo Blogi Postaus</Link>
              </MenubarItem>
              <MenubarItem>
                <Link href="/dashboard/article/all">Blogi Postaukset</Link>
              </MenubarItem>
              <MenubarItem>
                <Link href="/dashboard/profile">Muokkaa Profiilia</Link>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Sivu</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link href="/pages/about">Tietoa Minusta</Link>
              </MenubarItem>
              <MenubarItem>
                <Link href="/pages/contact">Ota Yhteyttä</Link>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <div className="flex gap-4 items-center">
          {/* Kirjanmerkki alue */}
          <Dialog>
            <DialogTrigger asChild={true}>
              <button>
                <i className="ri-heart-line text-2xl"></i>
              </button>
            </DialogTrigger>
            <DialogContent className={"max-w-xl text-white bg-[#050510] border-1 border-gray-800"}>
              <DialogHeader>
                <h3>Kirjanmerkki Postauksiin (3)</h3>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-6">
                <div className="grid flex-1 gap-2">
                  <div className="overflow-y-auto max-h[20rem]">
                    <div key={1}>
                      <Link href="/">
                        <div className="flex items-center gap-3 bg-[#08081a] p-3 rounded-lg my-5">
                          <img src={defaultArticle} className="w-33 h-20 object-cover rounded-lg" alt="" />
                          <div className="space-y-2 w">
                            <h3>Esimerkki Postauksen Otsikko</h3>
                            <div className="flex justify-between items-center gap-3">
                              <p className="text-sm text-gray-400">
                                <i className="fas fa-eye"></i> 123 Katselua
                              </p>
                              <button className="bg-red-200 text-red-600 px-3 py-2 rounded-sm hover:text-red-700">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Etsi Alue */}
          <Dialog>
            <DialogTrigger asChild={true}>
              <button>
                <i className="ri-search-line text-2xl"></i>
              </button>
            </DialogTrigger>
            <DialogContent className={"max-w-xl text-white bg-[#050510] border-1 border-gray-800"}>
              <DialogHeader>
                <input type="text" placeholder="Hae Avainsanaa..." name="" id="" className="border-1 border-[#0b0b24] bg-[#08081a] rounded-lg py-2 outline-0 focus:ring-indigo-500 focus:ring-2 px-2 placeholder:text-sm text-[#7070b2]" />
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-6">
                <div className="grid flex-1 gap-2">
                  <h1>3 Postausta löytynyt</h1>
                  <div className="overflow-y-auto max-h[20rem]">
                    <div key={1}>
                      <Link href="/">
                        <div className="flex items-center gap-3 bg-[#08081a] p-3 rounded-lg my-5">
                          <img src={defaultArticle} className="w-33 h-20 object-cover rounded-lg" alt="" />
                          <div className="space-y-2 w-full">
                            <h3>Esimerkki Postauksen Otsikko</h3>
                            <div className="flex justify-between items-center gap-3">
                              <p className="text-sm text-gray-400">
                                <i className="fas fa-eye"></i> 123 Katselua
                              </p>
                              <button className="bg-red-200 text-red-600 px-3 py-2 rounded-sm hover:text-red-700">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
          
          <Sheet >
            <SheetTrigger className="lg:hidden" asChild={true}>
              <i className="fas fa-bars text-2xl me-3"></i>
            </SheetTrigger>
            <SheetContent className={`bg-[#07050D] border border-[#110c1f] text-white`}>
              <SheetHeader>
                <SheetTitle className={"text-white"}>Jonin Blogi</SheetTitle>
              </SheetHeader>
              <ul className="ms-2 space-y-7">
                <li>
                  <a href="" className="flex items-center gap-3"><i className="fas fa-home"></i><span>Dasboard</span></a>
                </li><li>
                  <a href="" className="flex items-center gap-3"><i className="fas fa-book"></i><span>Blogi Postaukset</span></a>
                </li>
                <li>
                  <a href="" className="flex items-center gap-3"><i className="fas fa-user"></i><span>Profiili</span></a>
                </li>
                <li>
                  <a href="" className="flex items-center gap-3"><i className="fas fa-gear"></i><span>Asetukset</span></a>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  )
}

export default Header