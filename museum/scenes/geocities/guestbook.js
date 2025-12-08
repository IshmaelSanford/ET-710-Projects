// Initialize Supabase
const SUPABASE_URL = 'https://vsyrqyobpaschrftjkmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeXJxeW9icGFzY2hyZnRqa21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTYxNzAsImV4cCI6MjA3OTk5MjE3MH0.s1a6_w0tBk8YhbM-L5tShU00csKdHvAXiUgb91qjDnw';

// Check if supabase is available from CDN
if (window.supabase) {
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const guestbookForm = document.getElementById('guestbook-form');
    const guestbookEntries = document.getElementById('guestbook-entries');
    const errorMessage = document.getElementById('guestbook-error');

    // Fetch entries on load
    async function fetchEntries() {
        try {
            const { data, error } = await supabaseClient
                .from('guestbook')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            renderEntries(data);
        } catch (err) {
            console.error('Error fetching guestbook entries:', err);
            showError('Failed to load guestbook entries.');
        }
    }

    function renderEntries(entries) {
        guestbookEntries.innerHTML = '';
        if (!entries || entries.length === 0) {
            guestbookEntries.innerHTML = '<div style="text-align: center; padding: 10px;">No entries yet! Be the first!</div>';
            return;
        }

        entries.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'guestbook-entry';
            div.style.border = '2px solid gray';
            div.style.marginBottom = '10px';
            div.style.backgroundColor = '#fff';
            div.style.fontFamily = 'Times New Roman, serif';

            const date = new Date(entry.created_at).toLocaleString();
            const name = filterProfanity(entry.name || 'Anonymous');
            const message = filterProfanity(entry.message || '');
            
            div.innerHTML = `
                <div style="background: navy; color: white; padding: 2px 5px; font-weight: bold;">
                    ${escapeHtml(name)} <span style="font-weight: normal; font-size: 0.8em; float: right;">${date}</span>
                </div>
                <div style="padding: 5px;">
                    ${escapeHtml(message)}
                </div>
            `;
            guestbookEntries.appendChild(div);
        });
    }
    // SORRY I JUST DONT WANT THESE WORDS HERE..
    function filterProfanity(text) {
        if (!text) return '';
        const badWords = [
            'faggot', 'nigger', 'retard', 'spic', 'kike', 'chink', 'dyke', 'tranny'
        ];
        
        let filtered = text;
        badWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        });
        return filtered;
    }

    // Handle form submit
    if (guestbookForm) {
        guestbookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.style.display = 'none';

            const nameInput = document.getElementById('gb-name');
            const messageInput = document.getElementById('gb-message');
            const submitBtn = guestbookForm.querySelector('button[type="submit"]');

            const name = nameInput.value.trim() || 'Anonymous';
            const message = messageInput.value.trim();

            if (!message) {
                showError('Please write a message!');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing...';

            try {
                const { data, error } = await supabaseClient
                    .from('guestbook')
                    .insert([{ name, message }])
                    .select();

                if (error) throw error;

                // Clear form
                nameInput.value = '';
                messageInput.value = '';

                // Refresh list
                await fetchEntries();

            } catch (err) {
                console.error('Error signing guestbook:', err);
                showError('Failed to sign the guestbook. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Guestbook';
            }
        });
    }

    function showError(msg) {
        if (errorMessage) {
            errorMessage.textContent = msg;
            errorMessage.style.display = 'block';
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Start
    fetchEntries();
} else {
    console.error('Supabase client not found. Make sure the CDN script is loaded.');
}
