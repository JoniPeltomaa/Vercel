"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { toast } from "sonner";

export default function EditArticlePage() {
  const { slug } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [article, setArticle] = useState(null);

  // Hae kategoriat
  const fetchCategories = async () => {
    const { data } = await supabase.from("category").select("id, title");
    setCategories(data || []);
  };

  // Hae artikkeli slugilla
  const fetchArticle = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("article")
      .select(`
        id,
        title,
        content,
        thumbnail,
        slug,
        article_category (
          category_id
        )
      `)
      .eq("slug", slug)
      .single();

    if (error || !data) {
      toast.error("Artikkelia ei löytynyt");
      router.push("/dashboard");
      return;
    }

    setArticle(data);
    setTitle(data.title);
    setContent(data.content);
    setThumbnail(data.thumbnail);

    // Aseta valitut kategoriat pivot-taulusta
    const catIds = data.article_category?.map((c) => c.category_id) || [];
    setSelectedCategories(catIds);

    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchArticle();
    };

    loadData();
  }, [slug]);

  // Thumbnailin vaihto
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) setThumbnail(file);
  };

  // Tallennus
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // 1. Päivitä artikkeli
    const { error: updateError } = await supabase
      .from("article")
      .update({
        title,
        content,
        thumbnail: typeof thumbnail === "string" ? thumbnail : null,
        date_updated: new Date(),
      })
      .eq("id", article.id);

    if (updateError) {
      toast.error("Tallentaminen epäonnistui");
      setSaving(false);
      return;
    }

    // 2. Poista vanhat kategoriat pivot-taulusta
    await supabase
      .from("article_category")
      .delete()
      .eq("article_id", article.id);

    // 3. Lisää uudet kategoriat pivot-tauluun
    const newLinks = selectedCategories.map((catId) => ({
      article_id: article.id,
      category_id: Number(catId), // varmistetaan että on numero
    }));

    if (newLinks.length > 0) {
      await supabase.from("article_category").insert(newLinks);
    }

    toast.success("Artikkeli päivitetty!");
    router.push(`/blog/${article.slug}`);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-xl">Ladataan artikkelia...</div>
    );
  }

  return (
    <div>

      <section className="lg:px-33 px-5 lg:my-30 my-10 flex justify-center items-center">
        <div className="bg-[#050611e3] border border-[#110c1f] backdrop-blur-md w-full p-10 rounded-2xl">
          <div className="flex justify-between items-center mb-10">
            <h1 className="lg:text-5xl text-4xl font-bold">
              Muokkaa Blogi Viestiä ✏️
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 relative">
            {/* Thumbnail */}
            <div className="flex lg:flex-row flex-col gap-7 items-center">
              <Image
                width={500}
                height={500}
                src={
                  typeof thumbnail === "string"
                    ? thumbnail
                    : thumbnail
                    ? URL.createObjectURL(thumbnail)
                    : "/assets/images/default/defaultArticle.png"
                }
                className="w-[40rem] h-[20rem] object-cover rounded-xl"
                alt="Thumbnail Preview"
              />

              <div>
                <input
                  type="file"
                  id="article-image"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
                <label
                  htmlFor="article-image"
                  className="bg-gradient-to-r from-indigo-500 to-red-500 hover:from-red-500 hover:to-indigo-500 transition-all duration-500 text-[15px] text-white font-bold px-6 py-3 rounded-lg w-full"
                >
                  Vaihda Taustakuva
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <label htmlFor="title">Otsikko</label>
              <input
                id="title"
                type="text"
                placeholder="Kirjoita otsikko"
                className="bg-[#1a202c] border p-4 rounded-lg w-full outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-4">
              <label htmlFor="content">Viestin Sisältö</label>
              <textarea
                id="content"
                placeholder="Kirjoita viesti"
                className="bg-[#1a202c] border p-4 rounded-lg w-full outline-none h-60"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <label>Kategoriat</label>
              <select
                multiple
                className="bg-[#1a202c] p-4 rounded-lg w-full outline-none text-gray-300"
                value={selectedCategories}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (opt) => Number(opt.value)
                  );
                  setSelectedCategories(selected);
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Save button */}
            <div className="mt-10">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-red-500 hover:from-red-500 hover:to-indigo-500 transition-all duration-500 text-[15px] text-white font-bold px-6 py-3 rounded-lg w-full"
              >
                {saving ? "Tallennetaan..." : "Tallenna Muutokset"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

