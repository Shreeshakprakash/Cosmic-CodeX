document.addEventListener("DOMContentLoaded", () => {

    const supabaseUrl = "https://bzlijpmugslohymjxwrx.supabase.co";
    const supabaseKey = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq";

    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const signupForm = document.getElementById("signupForm");
    const signupBtn = document.getElementById("signupBtn");

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
            }

            signupBtn.innerHTML = "Account Created";
            signupBtn.style.background = "#10b981";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (err) {

            alert("Signup failed: " + err.message);

            signupBtn.innerHTML = originalText;
            signupBtn.style.pointerEvents = "auto";

        }

    });

});