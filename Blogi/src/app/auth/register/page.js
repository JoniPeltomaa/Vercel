"use client"
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { Header, Footer } from '@/app/components'
import Link from 'next/link'


export default function Register() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (password !== confirmPassword) {
      toast.error("Salasana Ei Täsmää!");
      return;
    }

    const {data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data:{ fullName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from("profile").insert([{ id: userId, full_name: fullName, role: "user" }]);
      if (profileError) {
        toast.error("Käyttäjä Profiilin luominen epä onnistui");
        setLoading(false);
        return;
      }
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email, password,
    });

    if (loginError) {
      toast.error("Rekisteröityminen onnistui, mutta kirjautuminen epäonnistui. Yritä kirjautua manuaalisesti.");
      setLoading(false);
      return;
    }

    toast.success("Rekisteröityminen onnistui! Uudelleenohjataan...");
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div>
      <Header />
      <section className='lg:px-33 px-5 lg:my-20 my-10 flex justify-center items-center'>
        <div className='bg-[#050611e3] backdrop-blur-md w-[33rem] p-10 rounded-2xl'>
          <div className='mb-10'>
            <h1 className='lg:text-5xl text-4xl font-bold'>Rekisteröi Tili 🔏</h1>
            <p className='font-normal text-sm mt-2'>Tervetuloa Jonin Blogi sivulle, rekisteröi tilisi</p>
          </div>
          <form onSubmit={handleRegister} className='space-y-5 relative'>
            <input type="text" placeholder='Koko Nimesi' className='border-3 border-[#e1d1ff7a] p-2 rounded-lg w-full outline-none' value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input type="email" placeholder='Sähköposti Osoite' className='border-3 border-[#e1d1ff7a] p-2 rounded-lg w-full outline-none' value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type='password' placeholder='Salasana' className='border-3 border-[#e1d1ff7a] p-2 rounded-lg w-full outline-none' value={password} onChange={(e) => setPassword(e.target.value)}/>
            <input type='password' placeholder='Vahvista Salasana' className='border-3 border-[#e1d1ff7a] p-2 rounded-lg w-full outline-none' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
            <button type='submit' disabled={loading} className="lg:flex justify-center items-center bg-gradient-to-r from-indigo-500 to-pink-500 cursor-pointer text-[15px] font-bold px-6 py-3 rounded-full border-0 me-3 w-full">
              {loading ? (
                <>
                  Luo Tunnukset... <i className="fas fa-spinner ms-1"></i>
                </>
              ): (
                <>
                  Luo Tunnukset<i className="fas fa-user-plus ms-1"></i>
                </>
              )}
            </button>
          </form>
          <p className='font-light text-xs text-center text-gray-300 mt-10'>Onko Sinulla jo tili? <Link className='border-b border-dashed border-gray-300' href="/auth/login">Kirjaudu Sisään</Link> </p>
        </div>
      </section>
      <Footer />
    </div>
  )
}
