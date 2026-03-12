const supabaseUrl = "https://bzlijpmugslohymjxwrx.supabase.co";
const supabaseKey = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const originalText = loginBtn.innerHTML;

        loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
        loginBtn.style.pointerEvents = "none";

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert("Invalid email or password");

            loginBtn.innerHTML = originalText;
            loginBtn.style.pointerEvents = "auto";
            return;
        }

        if (data.user) {

            loginBtn.innerHTML = "Success";
            loginBtn.style.background = "#10b981";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        }

    });

});