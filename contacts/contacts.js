var SUPABASE_URL = "https://bzlijpmugslohymjxwrx.supabase.co";
var SUPABASE_KEY = "sb_publishable_zqTgo87Jj99n3_27vIMZ_w_tKIVpAYq";
var contactsSupabase = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.__safenovaContactsInitialized) {
        return;
    }
    window.__safenovaContactsInitialized = true;

    const contactsList = document.getElementById('contacts-list');
    const addContactForm = document.getElementById('add-contact-form');

    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            contactsSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    } catch (error) {
        console.error('Supabase init failed, using local contacts only:', error);
    }

    function getCurrentUserId() {
        return localStorage.getItem('safenova_user_id');
    }

    renderContacts();

    if (addContactForm) {
        addContactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('contact-name');
            const phoneInput = document.getElementById('contact-phone');
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();

            if (!name || !phone) {
                alert('Please enter both name and phone number.');
                return;
            }

            const newContact = {
                id: Date.now().toString(),
                name,
                phone
            };

            // Always save locally first so UI remains reliable.
            saveContactsToLocalStorage([...getContactsFromLocalStorage(), newContact]);

            const userId = getCurrentUserId();
            if (userId && contactsSupabase) {
                const { error } = await contactsSupabase
                    .from('emergency_contacts')
                    .insert({
                        user_id: userId,
                        contact_name: name,
                        phone
                    });

                if (error) {
                    console.error('Supabase insert failed, using local backup:', error);
                }
            }

            nameInput.value = '';
            phoneInput.value = '';
            renderContacts();
        });
    }

    function getStorageKey() {
        const userId = getCurrentUserId();
        return userId ? `safenova_contacts_${userId}` : 'safenova_contacts_guest';
    }

    function getContactsFromLocalStorage() {
        const userContacts = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
        const userId = getCurrentUserId();

        // If logged in and no user-specific contacts yet, migrate guest contacts.
        if (userId && userContacts.length === 0) {
            const guestContacts = JSON.parse(localStorage.getItem('safenova_contacts_guest') || '[]');
            if (guestContacts.length > 0) {
                localStorage.setItem(getStorageKey(), JSON.stringify(guestContacts));
                return guestContacts;
            }
        }

        // One-time migration from old global key to user key.
        if (userContacts.length === 0) {
            const legacyContacts = JSON.parse(localStorage.getItem('safenova_contacts') || '[]');
            if (legacyContacts.length > 0) {
                localStorage.setItem(getStorageKey(), JSON.stringify(legacyContacts));
                localStorage.removeItem('safenova_contacts');
                return legacyContacts;
            }
        }

        return userContacts;
    }

    function saveContactsToLocalStorage(contacts) {
        localStorage.setItem(getStorageKey(), JSON.stringify(contacts));
    }

    async function getContacts() {
        const userId = getCurrentUserId();

        if (userId && contactsSupabase) {
            try {
                const { data, error } = await contactsSupabase
                    .from('emergency_contacts')
                    .select('id, contact_name, phone')
                    .eq('user_id', userId);

                if (!error && data) {
                    if (data.length > 0) {
                        return data.map((contact) => ({
                            id: contact.id,
                            name: contact.contact_name || 'Unknown',
                            phone: contact.phone || ''
                        }));
                    }

                    // If Supabase returns empty, still show local backup contacts.
                    return getContactsFromLocalStorage();
                }

                console.error('Supabase fetch failed, using local contacts:', error);
            } catch (error) {
                console.error('Supabase fetch crashed, using local contacts:', error);
            }
        }

        return getContactsFromLocalStorage();
    }

    async function renderContacts() {
        if (!contactsList) return;

        const contacts = await getContacts();
        contactsList.innerHTML = '';

        if (contacts.length === 0) {
            contactsList.innerHTML = `<p style="text-align:center; color: var(--text-secondary); margin-top:20px;">No emergency contacts added yet.</p>`;
            return;
        }

        contacts.forEach((contact) => {
            const div = document.createElement('div');
            div.className = 'contact-card';
            div.innerHTML = `
                <div class="contact-info">
                    <h3>${contact.name}</h3>
                    <p>${contact.phone}</p>
                </div>
                <div class="contact-actions">
                    <button class="call-btn" onclick="fakeCallContact('${contact.name.replace(/'/g, "\\'")}', '${contact.phone.replace(/'/g, "\\'")}')" title="Fake Call This Contact">
                        <i class="fa-solid fa-phone"></i>
                    </button>
                    <button onclick="removeContact('${contact.id}')" title="Remove Contact">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            contactsList.appendChild(div);
        });
    }

    window.fakeCallContact = function(name, phone) {
        const caller = encodeURIComponent(name || 'Unknown');
        const number = encodeURIComponent(phone || '');
        const fakeCallUrl = `../fake call/fakecall.html?caller=${caller}&phone=${number}&autostart=1&delay=3`;
        window.location.href = fakeCallUrl;
    };

    window.removeContact = async function(id) {
        if (!confirm('Remove this emergency contact?')) {
            return;
        }

        const userId = getCurrentUserId();
        if (userId && contactsSupabase) {
            try {
                const { error } = await contactsSupabase
                    .from('emergency_contacts')
                    .delete()
                    .eq('id', id)
                    .eq('user_id', userId);

                if (error) {
                    console.error('Supabase delete failed, falling back to local delete:', error);
                }
            } catch (error) {
                console.error('Supabase delete crashed, falling back to local delete:', error);
            }
        }

        const filtered = getContactsFromLocalStorage().filter((c) => c.id !== id);
        saveContactsToLocalStorage(filtered);
        renderContacts();
    };
});
