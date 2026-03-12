document.addEventListener("DOMContentLoaded", () => {

    const supabaseUrl = "https://bzlijpmugslohymjxwrx.supabase.co";
    const supabaseKey = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq";

    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const signupForm = document.getElementById("signupForm");
    const signupBtn = document.getElementById("signupBtn");
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

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }

        const originalText = signupBtn.innerHTML;
        signupBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
        signupBtn.style.pointerEvents = "none";

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            if (data?.user) {

                // Store user session
                localStorage.setItem('safenova_user_id', data.user.id);
                localStorage.setItem('safenova_user_email', data.user.email);

                // Create profile entry
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert([
                        {
                            id: data.user.id,
                            name: fullname,
                            email: email
                        }
                    ]);

                if (profileError) {
                    console.error("Profile insert error:", profileError);
                }

                console.log("Signup successful, redirecting...");

                signupBtn.innerHTML = "Success ✓";
                signupBtn.style.background = "#10b981";

                setTimeout(() => {
                    const redirectPath = window.location.pathname.includes('login/') 
                        ? '../index.html' 
                        : 'index.html';
                    console.log("Redirecting to:", redirectPath);
                    window.location.replace(redirectPath);
                }, 800);
            }

        } catch (err) {

            console.error("Signup error:", err);
            alert("Signup failed: " + err.message);

            signupBtn.innerHTML = originalText;
            signupBtn.style.pointerEvents = "auto";

        }

    });

});