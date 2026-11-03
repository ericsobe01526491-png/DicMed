
(() => {
    "use strict";

    const db = window.dicmedSupabase;
    const $ = id => document.getElementById(id);

    const loginPanel = $("login-panel");
    const dashboard = $("dashboard");
    const list = $("suggestions-list");
    const template = $("suggestion-template");

    let suggestions = [];
    let currentFilter = "TOUTES";

    function setMessage(element, text, kind = "") {
        element.textContent = text || "";
        element.classList.remove("error", "success");

        if (kind) element.classList.add(kind);
    }

    function showDashboard(visible) {
        loginPanel.hidden = visible;
        dashboard.hidden = !visible;
    }

    function safe(value) {
        return value === null || value === undefined || value === ""
            ? "—"
            : String(value);
    }

    function formatDate(value) {
        if (!value) return "Date inconnue";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "Date inconnue";

        return new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    }

    function typeLabel(value) {
        return ({
            nouveau_terme: "Nouveau terme",
            correction: "Correction",
            complement: "Complément"
        })[String(value || "").toLowerCase()] || safe(value);
    }

    function statusLabel(value) {
        return ({
            EN_ATTENTE: "En attente",
            ACCEPTEE: "Acceptée",
            REFUSEE: "Refusée"
        })[value] || safe(value);
    }

    function addDetail(parent, label, value) {
        const box = document.createElement("div");
        const title = document.createElement("strong");
        const content = document.createElement("p");

        box.className = "detail";
        title.textContent = label;
        content.textContent = safe(value);

        box.append(title, content);
        parent.appendChild(box);
    }

    async function loadSuggestions() {
        setMessage($("dashboard-message"), "Chargement des propositions…");
        list.replaceChildren();

        const { data, error } = await db
            .from("suggestions")
            .select(`
                id,
                type,
                terme_propose,
                terme_cible,
                champ_cible,
                contenu_propose,
                justification,
                statut,
                motif_refus,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (error) {
            setMessage(
                $("dashboard-message"),
                "Erreur de chargement : " + error.message,
                "error"
            );

            list.textContent = "Impossible de charger les propositions.";
            return;
        }

        suggestions = data || [];

        $("count-pending").textContent =
            suggestions.filter(x => x.statut === "EN_ATTENTE").length;

        $("count-accepted").textContent =
            suggestions.filter(x => x.statut === "ACCEPTEE").length;

        $("count-rejected").textContent =
            suggestions.filter(x => x.statut === "REFUSEE").length;

        renderSuggestions();

        setMessage(
            $("dashboard-message"),
            suggestions.length + " proposition(s) chargée(s).",
            "success"
        );
    }

    function renderSuggestions() {
        list.replaceChildren();

        const visible = currentFilter === "TOUTES"
            ? suggestions
            : suggestions.filter(x => x.statut === currentFilter);

        if (visible.length === 0) {
            list.textContent = "Aucune proposition dans cette catégorie.";
            return;
        }

        visible.forEach(item => {
            const fragment = template.content.cloneNode(true);

            fragment.querySelector(".type-badge").textContent =
                typeLabel(item.type);

            fragment.querySelector(".term-title").textContent =
                item.terme_propose ||
                item.terme_cible ||
                "Proposition sans titre";

            const badge = fragment.querySelector(".status-badge");

            badge.textContent = statusLabel(item.statut);

            badge.classList.add(
                item.statut === "ACCEPTEE" ? "accepted" :
                item.statut === "REFUSEE" ? "rejected" :
                "pending"
            );

            fragment.querySelector(".date").textContent =
                formatDate(item.created_at);

            const details = fragment.querySelector(".details");

            addDetail(details, "Terme proposé", item.terme_propose);
            addDetail(details, "Terme concerné", item.terme_cible);
            addDetail(details, "Rubrique", item.champ_cible);
            addDetail(details, "Contenu proposé", item.contenu_propose);
            addDetail(details, "Justification / source", item.justification);

            const decisionArea =
                fragment.querySelector(".decision-area");

            if (item.statut === "EN_ATTENTE") {
                const accept = document.createElement("button");
                const reject = document.createElement("button");

                accept.type = "button";
                accept.className = "accept";
                accept.textContent = "Accepter";

                accept.addEventListener("click", () => {
                    updateDecision(item.id, "ACCEPTEE", null, accept);
                });

                reject.type = "button";
                reject.className = "reject";
                reject.textContent = "Refuser";

                reject.addEventListener("click", () => {
                    showRefusalForm(decisionArea, item.id);
                });

                decisionArea.append(accept, reject);

            } else if (item.statut === "REFUSEE") {
                const note = document.createElement("p");

                note.className = "refusal-note";
                note.textContent =
                    "Motif du refus : " + safe(item.motif_refus);

                decisionArea.appendChild(note);

            } else {
                const note = document.createElement("p");

                note.className = "muted";
                note.textContent =
                    "Acceptée. Son intégration au dictionnaire reste manuelle.";

                decisionArea.appendChild(note);
            }

            list.appendChild(fragment);
        });
    }

    function showRefusalForm(area, id) {
        if (area.querySelector("form")) return;

        const form = document.createElement("form");
        const label = document.createElement("label");
        const textarea = document.createElement("textarea");
        const submit = document.createElement("button");
        const cancel = document.createElement("button");

        label.textContent = "Motif du refus (obligatoire)";

        textarea.rows = 3;
        textarea.required = true;
        textarea.maxLength = 1500;
        textarea.className = "refusal-reason";
        textarea.placeholder =
            "Explique pourquoi cette proposition est refusée…";

        submit.type = "submit";
        submit.className = "reject";
        submit.textContent = "Confirmer le refus";

        cancel.type = "button";
        cancel.className = "secondary";
        cancel.textContent = "Annuler";

        cancel.addEventListener("click", () => form.remove());

        form.append(label, textarea, submit, cancel);
        area.appendChild(form);

        textarea.focus();

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const reason = textarea.value.trim();

            if (!reason) {
                textarea.focus();
                return;
            }

            await updateDecision(id, "REFUSEE", reason, submit);
        });
    }

    async function updateDecision(id, status, reason, button) {
        button.disabled = true;

        setMessage(
            $("dashboard-message"),
            "Enregistrement de la décision…"
        );

        try {
            const { data, error } = await db
                .from("suggestions")
                .update({
                    statut: status,
                    motif_refus: status === "REFUSEE" ? reason : null
                })
                .eq("id", id)
                .eq("statut", "EN_ATTENTE")
                .select("id");

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error(
                    "Aucune proposition modifiée. Elle a peut-être déjà été traitée."
                );
            }

            await loadSuggestions();

            setMessage(
                $("dashboard-message"),
                "Décision enregistrée avec succès.",
                "success"
            );

        } catch (error) {
            setMessage(
                $("dashboard-message"),
                "Erreur : " + error.message,
                "error"
            );

            button.disabled = false;
        }
    }

    async function verifyAdmin(session) {
        if (!session) {
            showDashboard(false);
            return;
        }

        const { data, error } = await db.rpc("is_dicmed_admin");

        if (error || data !== true) {
            await db.auth.signOut();
            showDashboard(false);

            setMessage(
                $("login-message"),
                "Ce compte n'est pas autorisé à accéder à l'administration.",
                "error"
            );

            return;
        }

        showDashboard(true);
        await loadSuggestions();
    }

    if (!db) {
        setMessage(
            $("login-message"),
            "Supabase n'est pas initialisé. Vérifie supabase-config.js.",
            "error"
        );

        $("login-button").disabled = true;
        return;
    }

    $("login-form").addEventListener("submit", async event => {
        event.preventDefault();

        const button = $("login-button");
        button.disabled = true;

        setMessage($("login-message"), "Connexion en cours…");

        try {
            const { data, error } = await db.auth.signInWithPassword({
                email: $("email").value.trim(),
                password: $("password").value
            });

            if (error) throw error;

            await verifyAdmin(data.session);

        } catch (error) {
            setMessage(
                $("login-message"),
                "Connexion impossible : vérifie tes identifiants.",
                "error"
            );

        } finally {
            button.disabled = false;
        }
    });

    $("logout-button").addEventListener("click", async () => {
        const { error } = await db.auth.signOut();

        if (error) {
            setMessage(
                $("dashboard-message"),
                "Erreur lors de la déconnexion.",
                "error"
            );
            return;
        }

        showDashboard(false);

        setMessage(
            $("login-message"),
            "Déconnexion effectuée.",
            "success"
        );
    });

    $("refresh-button").addEventListener("click", loadSuggestions);

    document.querySelectorAll(".filter").forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;

            document.querySelectorAll(".filter").forEach(item => {
                item.classList.toggle("active", item === button);
            });

            renderSuggestions();
        });
    });

    db.auth.getSession().then(({ data, error }) => {
        if (error) {
            setMessage(
                $("login-message"),
                "Impossible de vérifier la session.",
                "error"
            );
            return;
        }

        verifyAdmin(data.session);
    });

    db.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            showDashboard(false);
        }
    });

})();

