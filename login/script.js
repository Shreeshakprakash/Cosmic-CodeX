const supabaseUrl = "https://bzlijpmugslohymjxwrx.supabase.co";
const supabaseKey = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");
    const togglePasswordBtn = document.getElementById("togglePasswordBtn");
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");

    // Password toggle functionality
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                passwordInput.type = "password";
                eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    }

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const originalText = loginBtn.innerHTML;

        loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
        loginBtn.style.pointerEvents = "none";

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            if (data.user) {

                // Store user session
                localStorage.setItem('safenova_user_id', data.user.id);
                localStorage.setItem('safenova_user_email', data.user.email);

                console.log("Login successful, redirecting...");
                
                loginBtn.innerHTML = "Success ✓";
                loginBtn.style.background = "#10b981";

                // Redirect immediately - use replace to prevent back button issues
                setTimeout(() => {
    window.location.href = "/index.html";
}, 800);
            }

        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed: " + (error.message || "Invalid email or password"));

            loginBtn.innerHTML = originalText;
            loginBtn.style.pointerEvents = "auto";
        }

    });

});