"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header, Footer } from "@/app/components";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { toast } from "sonner";
import { defaultAvatar } from "@/app/components/images";
import { RefreshComponent } from "@/lib/utils";

export default function Page() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({ full_name: "", job_title: "", country: "", biography: "", image: "" });
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    

  // -----------------------------
  // HANDLE INPUT CHANGE
  // -----------------------------
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // -----------------------------
  // IMAGE UPLOAD
  // -----------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setLoading(true);

    const { error } = await supabase.storage
      .from("blog-bucket")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast.error("Virhe kuvan päivittämisessä: " + error.message);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage
      .from("blog-bucket")
      .getPublicUrl(filePath);

    setProfile((prev) => ({ ...prev, image: data.publicUrl }));
    setLoading(false);
    toast.success("Kuva päivitetty onnistuneesti!");
  };

  // -----------------------------
  // SUBMIT PROFILE
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.id) {
      toast.error("Käyttäjää ei ole ladattu");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profile")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast.error("Virhe profiilin päivittämisessä: " + error.message);
    } else {
      toast.success("Profiilin päivittäminen onnistui!");
    }

    setLoading(false);
  };

  // -----------------------------
  // LOAD PROFILE WHEN USER READY
  // -----------------------------
  useEffect(() => {
  if (!user?.id) return;

  const fetchProfile = async () => {
    setLoadingProfile(true);

    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    // Jos profiiliriviä ei ole → luodaan se
    if (!data) {
      await supabase.from("profile").insert({
        id: user.id,
        full_name: "",
        job_title: "",
        country: "",
        biography: "",
        image: ""
      });

      const { data: newData } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile({
        full_name: newData.full_name ?? "",
        job_title: newData.job_title ?? "",
        country: newData.country ?? "",
        biography: newData.biography ?? "",
        image: newData.image ?? ""
      });

      setLoadingProfile(false);
      return;
    }

    // Jos profiilirivi löytyi
    setProfile({
      full_name: data.full_name ?? "",
      job_title: data.job_title ?? "",
      country: data.country ?? "",
      biography: data.biography ?? "",
      image: data.image ?? ""
    });

    setLoadingProfile(false);
  };

  fetchProfile();
}, [user?.id]);

    return (
        <div>
            <Header />
            <section className="lg:px-33 px-5 lg:my-30 my-10 flex justify-center items-center">
                <div className="bg-[#050611e3] border border-[#110c1f] backdrop-blur-md w-full p-10 rounded-2xl">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="mb-10 flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <Image src={profile?.image || defaultAvatar} width={132} height={132} className="rounded-full h-33 w-33 object-cover" alt="Profile" />
                                <input type="file" id="profile-image" className="hidden" onChange={handleImageUpload} />
                                <label htmlFor="profile-image" className="bg-gradient-to-r from-indigo-500 to-red-500 hover:from-red-500 hover:to-indigo-500 transition-all duration-500 text-[15px] text-white font-bold px-6 py-3 rounded-lg">
                                    Vaihda Profiili kuva <i className="fas fa-image ms-2" />
                                </label>
                            </div>

                            <div className="text-white text-sm" onClick={fetchProfile}>
                                [RefreshComponent]
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label>Koko Nimi</label>
                            <input className="bg-[#1a202c] p-4 rounded-lg w-full outline-none" name="full_name" value={profile?.full_name} onChange={handleChange} placeholder="Enter your full name" type="text" />
                        </div>

                        <div className="flex md:flex-row flex-col justify-between gap-6">
                            <div className="space-y-4 w-full">
                                <label>Job Title</label>
                                <input className="bg-[#1a202c] p-4 rounded-lg w-full outline-none" name="job_title" value={profile?.job_title ?? ""} onChange={handleChange} placeholder="Enter your job title" type="text" />
                            </div>
                        </div>

                        <div className="mt-10">
                            <button type="submit" disabled={false} className="bg-gradient-to-r from-indigo-500 to-red-500 hover:from-red-500 hover:to-indigo-500 transition-all duration-500 text-[15px] text-white font-bold px-6 py-3 rounded-lg w-full">
                                {loading ? "Saving..." : "Save Changes"} <i className="fas fa-save ms-1"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </section>
            <Footer />
        </div>
    );
}
