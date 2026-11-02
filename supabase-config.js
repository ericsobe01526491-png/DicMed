const SUPABASE_URL = "https://bvtqjrhzndrrctbqdhnn.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NxUCxX78CrH-1cL0C2CytA_5Y1jrfpW";

window.dicmedSupabase = null;

try {
    window.dicmedSupabase = window.supabase.createClient(
        SUPABASE_URL.trim(),
        SUPABASE_PUBLISHABLE_KEY.trim()
    );

    console.log("DICMED : connexion Supabase initialisée.");
} catch (error) {
    console.error("Erreur de configuration Supabase :", error);
}
// ========================================
// TEST DE COMMUNICATION SUPABASE
// ========================================

async function testerSupabase() {
    const { data, error } = await window.dicmedSupabase
        .from("suggestions")
        .select("id")
        .limit(1);

    if (error) {
        console.error("Erreur Supabase :", error.message);
        return;
    }

    console.log("Communication Supabase réussie !");
    console.log("Données reçues :", data);
}

testerSupabase();