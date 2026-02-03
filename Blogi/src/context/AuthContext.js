"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const router = useRouter()

    useEffect(() => {
        const loadUserProfile = async (userId) => {
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from("profile")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (profileError) {
                    console.error(
                        "Virhe haettaessa profiilia:",
                        profileError.message
                    );
                } else {
                    setProfile(profileData);
                }
            } catch (error) {
                console.error(
                    "Profiilin lataaminen epäonnistui:",
                    error
                );
            }
        };

        const checkUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();

                if (error || !data.error) {
                    setUser(null);
                    setProfile(null);
                } else {
                    setUser(data?.user);
                    loadUserProfile(data?.user?.id);
                }
            } catch (error) {
                console.error("Käyttäjän tarkistus epäonnistui:", error);
            }

            setLoading(false);

        };

        const { data: autListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session && session?.user) {
                    setUser(session.user);
                    loadUserProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        );

        checkUser();

        return () => autListener.subscription.unsubscribe();
    }, [router, user]);

    return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>
};

export const useAuth = () => useContext(AuthContext);