"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header, Footer } from "@/app/components";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { convertLargeImageToWebP } from "@/lib/utils";

export default function Page() {
    const router = useRouter()
    const SearchParams = useSearchParams()
    const { user } = useAuth()

    const articleId = SearchParams.get("id")

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState([])
    const [thumbnail, setThumbnail] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingArticle, setLoadingArticle] = useState(false)
    const [categories, setCategories] = useState([])
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
        const { data, error } = await supabase
                .from("category")
                .select("*")

            if (error) {
                toast.error("Epäonnistui hakeminen kategoria")
                console.log("kategorioiden hakeminen epäonnistui", error)
                return
            }

            setCategories(data)
        }

        const fetchArticle = async () => {
        if (articleId && user) {
                setLoadingArticle(true)

                const { data, error } = await supabase
                    .from("article")
                    .select(`
                        *,
                        categories:article_category(
                            category:category_id(id, title, slug)
                        )
                    `)
                    .eq("id", articleId)
                    .eq("profile_id", user?.id)
                    .single()

                if (error) {
                    toast.error("Virhe ladattaessa viestejä")
                    console.error("Hakemisen Virhe: ", error)
                } else {
                    setTitle(data?.title)
                    setContent(data?.content)
                    setThumbnail(data?.thumbnail)

                    // ⬇️ Muutettu: useita kategorioita
                    setCategory(
                        data?.categories?.map(c => c.category.id) || []
                    )
                }

                setLoadingArticle(false)
            }
        }

        fetchCategories()
        fetchArticle()
    }, [articleId, user])



    useEffect(() => {
        if (thumbnail && typeof thumbnail !== "string") {
            const objectUrl = URL.createObjectURL(thumbnail);
            setPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [thumbnail]);


    const handleThumbnailChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Sallitaan jopa 50 MB kuvat
  if (file.size > 50 * 1024 * 1024) {
    toast.error("Kuva on liian suuri. Maksimi koko on 50MB.");
    return;
  }

  try {
    // 🔥 Muunna WebP:ksi automaattisesti
    const webpBlob = await convertLargeImageToWebP(file);

    // Luo uusi File WebP‑blobista
    const webpFile = new File(
      [webpBlob],
      file.name.replace(/\.\w+$/, ".webp"),
      { type: "image/webp" }
    );

    setThumbnail(webpFile);
  } catch (err) {
    console.error(err);
    toast.error("Kuvan muuntaminen epäonnistui");
  }
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const wordCount =
            content?.replace(/<[^>]*>/g, "")?.trim()?.split(/\s+/)?.length || 0;
        const readTime = Math.ceil(wordCount / 200);

        let thumbnailUrl = null;

        // Upload thumbnail
        if (thumbnail && thumbnail.name) {
            const fileExt = thumbnail.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
            .from("blog-bucket")
            .upload(filePath, thumbnail);

            if (uploadError) {
            toast.error("Taustakuvan päivittäminen epäonnistui");
            console.log("Päivittäminen Virhe: ", uploadError);
            setLoading(false);
            return;
            }

            const { data: publicUrlData } = supabase.storage
            .from("blog-bucket")
            .getPublicUrl(filePath);

            thumbnailUrl = publicUrlData.publicUrl;
        }

        const slug = title
            ?.toLowerCase()
            ?.trim()
            ?.replace(/<[^>]*>/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        // EDIT MODE
        if (articleId) {
            // Update article
            const { error } = await supabase
            .from("article")
            .update({
                title,
                content,
                thumbnail: thumbnailUrl ?? undefined,
                read_time: readTime,
            })
            .eq("id", articleId)
            .eq("profile_id", user?.id);

            if (error) {
            toast.error("Viestin päivittäminen epäonnistui");
            console.log("Update Error: ", error);
            setLoading(false);
            return;
            }

            // Update categories
            await supabase.from("article_category").delete().eq("article_id", articleId);

            await supabase.from("article_category").insert(
            category.map((catId) => ({
                article_id: articleId,
                category_id: catId,
            }))
            );

            toast.success("Viestin päivittäminen onnistui");
        }

        // CREATE MODE
        else {
            const { data, error } = await supabase
            .from("article")
            .insert({
                title,
                content,
                thumbnail: thumbnailUrl ?? undefined,
                read_time: readTime,
                slug,
                profile_id: user?.id,
            })
            .select("id")
            .single();

            if (error) {
            toast.error("Viestin Luominen epäonnistui");
            console.log("Insert Error: ", error);
            setLoading(false);
            return;
            }

            // Insert categories
            await supabase.from("article_category").insert(
            category.map((catId) => ({
                article_id: data.id,
                category_id: catId,
            }))
            );

            toast.success("Viestin luonti onnistui");
            router.push(`/dashboard/article/manage?id=${data?.id}`);
        }

        setLoading(false);
        };
  return (
    <div>
        <Header pageType="dashboard" />
        <section className="lg:px-33 px-5 lg:my-30 my-10 flex justify-center items-center">
            <div className="bg-[#050611e3] border border-[#110c1f] backdrop-blur-md w-full p-10 rounded-2xl">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="lg:text-5xl text-4xl font-bold">Luo Blogi Viesti 📝</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10 relative">
                    {/* Thumbnail Section */}
                    <div className="flex lg:flex-row flex-col gap-7 items-center">
                        <Image
                            width={500}
                            height={500}
                            src={
                               preview ||
                                (typeof thumbnail === "string" && thumbnail.startsWith("http")
                                    ? thumbnail
                                    : "/assets/images/default/defaultArticle.png")
                            }
                            className="w-[40rem] h-[20rem] object-cover rounded-xl"
                            alt="Thumbnail Preview"
                        />
                        <div>
                            <input type="file" id="article-image" className="hidden" onChange={handleThumbnailChange} />
                            <label htmlFor="article-image" className="bg-gradient-to-r from-indigo-500 to-red-500 hover:from-red-500 hover:to-indigo-500 transition-all duration-500 text-[15px] text-white font-bold px-6 py-3 rounded-lg w-full">
                                Lataa Taustakuva
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label htmlFor="title">Otsikko</label>
                        <input id="title" type="text" placeholder="Kirjoita otsikko" className="bg-[#1a202c] border p-4 rounded-lg w-full outline-none" value={title} onChange={(e) => {setTitle(e.target.value)}} required />
                    </div>

                    {/* Content Field with CKEditor */}
                    <div className="space-y-4">
                        <label htmlFor="content">Vietin Sisältö</label>
                        <textarea id="content" type="text" placeholder="Kirjoita viesti" className="bg-[#1a202c] border p-4 rounded-lg w-full outline-none" value={content} onChange={(e) => {setContent(e.target.value)}} required />
                    </div>

                    {/* Category Selection */}
                    <div className="flex md:flex-row flex-col justify-between gap-5">
                    <div className="space-y-4 w-full">
                        <label>Kategoriat</label>

                        <div className="flex flex-wrap gap-3">
                        {categories?.map((cat) => {
                            const active = category.includes(cat.id);

                            return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                if (active) {
                                    setCategory(category.filter((id) => id !== cat.id));
                                } else {
                                    setCategory([...category, cat.id]);
                                }
                                }}
                                className={`px-4 py-2 rounded-lg border transition-all duration-200
                                ${
                                    active
                                    ? "bg-indigo-600 border-indigo-700 text-white"
                                    : "bg-[#1a202c] border-gray-700 text-gray-300 hover:bg-[#2a3240]"
                                }
                                `}
                            >
                                {cat.title}
                            </button>
                            );
                        })}
                        </div>
                    </div>
                    </div>
                    {/* Submit Button */}
                    <div className="mt-10">
                        <button type="submit" className="bg-gradient-to-r from-indigo-500 to-red-500 hover:from-red-500 hover:to-indigo-500 transition-all duration-500 text-[15px] text-white font-bold px-6 py-3 rounded-lg w-full">
                            {loading ? (
                                articleId ? (
                                    <> 
                                        Päivitetään Blogi Viestiä <i className="fas fa-spinner fa-spin ms-2" />
                                    </>
                                ) : (
                                    <> 
                                        Luodaan Blogi Viestiä <i className="fas fa-spinner fa-spin ms-2" />
                                    </>
                                )
                            ) : articleId ? (
                                <>
                                    Päivitä Blogi Viesti <i className="fas fa-paper-plane ms-2" />
                                </>
                            ) : (
                                <>
                                    Luo Blogi Viesti <i className="fas fa-paper-plane ms-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
        <Footer />
    </div>
  )
}
