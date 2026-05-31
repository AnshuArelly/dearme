// Client State Variables
let userProfile = null;
let chatHistory = [];

/* --- Intersection Observer for Motion Physics --- */
const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
    elementObserver.observe(section);
});

/**
 * Custom Toast Notification System
 * @param {string} message - Text message to show
 */
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const toastText = document.getElementById('toastText');
    
    toastText.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

/**
 * Simulated Typewriter effect for premium reveals
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text to write
 * @param {number} speed - Typing speed in ms per word
 * @param {Function} callback - Callback on completion
 */
function typewriteText(element, text, speed = 50, callback = null) {
    element.innerHTML = "";
    const words = text.split(" ");
    let i = 0;
    
    function type() {
        if (i < words.length) {
            element.innerHTML += (i === 0 ? "" : " ") + words[i];
            i++;
            // Adjust scrolling as content prints
            const resultCard = element.closest('.glass-card');
            if (resultCard) {
                // Ensure container size updates scroll
            }
            setTimeout(type, speed);
        } else {
            if (callback) callback();
        }
    }
    type();
}

/**
 * Primary Form submission handler to generate FutureMe Profile
 */
async function generateIdentity(event) {
    event.preventDefault();

    // Form Parameter Extractions
    const name = document.getElementById('userName').value.trim();
    const age = parseInt(document.getElementById('userAge').value);
    const goal = document.getElementById('userGoal').value.trim();
    const struggle = document.getElementById('userStruggle').value.trim();
    const timeline = document.getElementById('userTimeline').value.trim();
    const tone = document.querySelector('input[name="tone"]:checked').value;
    
    const errorBanner = document.getElementById('errorBanner');
    const loader = document.getElementById('loadingOrchestrator');
    const result = document.getElementById('resultContainer');
    const form = document.getElementById('futureMeForm');
    const btnSubmit = document.getElementById('btnSubmitForm');

    // Validation Check
    if (!name || !age || !goal || !struggle || !timeline || !tone) {
        errorBanner.innerText = "Please supply all parameters to ensure temporal fidelity.";
        errorBanner.style.display = 'block';
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
        return;
    }
    
    errorBanner.style.display = 'none';
    btnSubmit.disabled = true;
    
    // UI Phase Transition
    form.style.display = 'none';
    loader.style.display = 'block';
    result.style.display = 'none';

    // Loading Text Progression Sequence
    const steps = [
        "Isolating present performance parameters...",
        "Running structural diagnostics on existing friction points...",
        "Extrapolating timeline to future nexus...",
        "Assembling identity construct matrix...",
        "Establishing contact with your future self..."
    ];
    let stepIndex = 0;
    const loadingTextNode = document.getElementById('loadingTextText');
    loadingTextNode.innerText = steps[0];
    
    const loadingInterval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
            loadingTextNode.innerText = steps[stepIndex];
        }
    }, 1200);

    try {
        // Send reflection data to the backend API
        const response = await fetch('/api/generate-dearme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                age: age.toString(),
                goal,
                struggle,
                oneYearVision: timeline,
                tone
            })
        });

        clearInterval(loadingInterval);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resData = await response.json();
        
        if (!resData.success || !resData.data) {
            throw new Error(resData.error || "Failed parsing generation.");
        }

        const data = resData.data;

        // Store active session profile for chat context
        userProfile = { name, age, goal, struggle, oneYearVision: timeline, tone };
        chatHistory = []; // Reset history for new generation

        // Update Dynamic UI Fields
        document.getElementById('outputToneBadge').innerText = `${tone} Matrix`;
        document.getElementById('outputIdentity').innerText = data.futureIdentity || "A highly evolved operational version of yourself.";
        document.getElementById('outputHabit').innerText = data.habit || "Small daily progress rituals.";
        document.getElementById('outputWarning').innerText = data.warning || "Falling back into comfort zones.";
        document.getElementById('outputMantra').innerText = data.mantra ? `“${data.mantra}”` : "“Focus on execution.”";

        // Render Next 3 Moves List
        const movesNode = document.getElementById('outputMoves');
        movesNode.innerHTML = "";
        const movesList = data.nextMoves || ["Prioritize deep work.", "Tackle bottleneck issues.", "Audit habits."];
        movesList.forEach(move => {
            const li = document.createElement('li');
            li.innerText = move;
            movesNode.appendChild(li);
        });

        // Sync visual tweaks with Hero Section preview card
        const truncatedPreview = data.message.length > 95 ? data.message.slice(0, 95) + "..." : data.message;
        document.getElementById('previewDynamicText').innerText = truncatedPreview;

        // Prepare & Initialize Chat Interface
        setupChatInterface(data.message);

        // Hide Loader, Display Card
        loader.style.display = 'none';
        result.style.display = 'block';

        // Trigger Typewriter effect on main manifesto letter
        typewriteText(document.getElementById('outputManifesto'), data.message, 35, () => {
            btnSubmit.disabled = false;
        });

        // Smooth Scroll to Result Card
        setTimeout(() => {
            window.scrollTo({
                top: result.offsetTop - 80,
                behavior: 'smooth'
            });
        }, 150);

    } catch (err) {
        console.error("DearMe generation error:", err);
        clearInterval(loadingInterval);
        
        // Re-display form and error banner
        loader.style.display = 'none';
        form.style.display = 'block';
        btnSubmit.disabled = false;
        
        errorBanner.innerText = "DearMe could not respond right now. Try again.";
        errorBanner.style.display = 'block';
        
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
    }
}

/**
 * Configures the live chat area once user profile is generated
 * @param {string} initialMessage - The letter output text from Gemini
 */
function setupChatInterface(initialMessage) {
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const scroller = document.getElementById('chatScroller');
    const statusText = document.getElementById('chatStatusText');
    const statusBadge = document.getElementById('chatStatusBadge');
    const headerTitle = document.getElementById('chatHeaderTitle');
    const avatarInitials = document.getElementById('chatAvatarInitials');

    // Update Header states
    headerTitle.innerText = `${userProfile.name} (+1 Year)`;
    avatarInitials.innerText = userProfile.name.slice(0, 2).toUpperCase();
    statusText.innerText = "Synchronized";
    statusText.classList.add('synchronized');
    statusBadge.innerText = "Timeline Active";
    statusBadge.classList.add('badge-glow');

    // Enable Text Controls
    chatInput.disabled = false;
    chatInput.placeholder = `Ask your future self anything...`;
    sendChatBtn.disabled = false;

    // Load initial greeting
    scroller.innerHTML = "";
    
    const greetingMsg = `Hello, ${userProfile.name}. I am the version of you who already navigated this year and achieved our vision of ${userProfile.oneYearVision}. I remember carrying the weight of being ${userProfile.age} and feeling held back by ${userProfile.struggle}. Ask me anything about how we crossed the line.`;
    
    appendChatBubble(greetingMsg, 'future');
    
    // Seed chat history context
    chatHistory.push({
        role: 'futureme',
        message: greetingMsg
    });
}

/**
 * Appends a bubble component to the scroll area
 * @param {string} text - Message text content
 * @param {'user'|'future'|'system'} sender - Message sender classification
 */
function appendChatBubble(text, sender) {
    const scroller = document.getElementById('chatScroller');
    
    if (sender === 'system') {
        const div = document.createElement('div');
        div.style.textAlign = 'center';
        div.style.fontSize = '0.8rem';
        div.style.color = 'var(--text-tertiary)';
        div.style.margin = '8px 0';
        div.innerText = text;
        scroller.appendChild(div);
    } else {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble bubble-${sender}`;
        bubble.innerText = text;
        scroller.appendChild(bubble);
    }
    
    // Auto-scroll downwards
    scroller.scrollTop = scroller.scrollHeight;
}

/**
 * Renders typing indicator bubble in the chat view
 * @returns {HTMLElement} The created indicator element
 */
function showTypingIndicator() {
    const scroller = document.getElementById('chatScroller');
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator-bubble';
    indicator.id = 'chatTypingIndicator';
    indicator.innerHTML = `
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    scroller.appendChild(indicator);
    scroller.scrollTop = scroller.scrollHeight;
    return indicator;
}

/**
 * Transmits the typed message, sends it to `/api/chat-futureme` and appends replies
 */
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const query = chatInput.value.trim();

    if (!query) return;
    if (!userProfile) {
        showToast("Please initialize alignment with the form first.");
        return;
    }

    // Append user message
    appendChatBubble(query, 'user');
    chatInput.value = "";
    
    // Freeze controls during API transaction
    chatInput.disabled = true;
    sendChatBtn.disabled = true;

    // Show Loader dots
    const indicator = showTypingIndicator();
    const statusText = document.getElementById('chatStatusText');
    statusText.innerText = "Interacting...";

    try {
        const response = await fetch('/api/chat-dearme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userProfile: {
                    name: userProfile.name,
                    age: userProfile.age.toString(),
                    goal: userProfile.goal,
                    struggle: userProfile.struggle,
                    oneYearVision: userProfile.oneYearVision,
                    tone: userProfile.tone
                },
                chatHistory: chatHistory,
                question: query
            })
        });

        // Remove dots
        if (indicator) indicator.remove();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.reply) {
            throw new Error(data.error || "Empty chat response from server.");
        }

        const reply = data.reply;

        // Append to state
        chatHistory.push({ role: 'user', message: query });
        chatHistory.push({ role: 'futureme', message: reply });

        // Append to UI
        appendChatBubble(reply, 'future');
        
        statusText.innerText = "Synchronized";

    } catch (err) {
        console.error("Chat error:", err);
        if (indicator) indicator.remove();
        
        appendChatBubble("DearMe timeline interrupted. Try asking again.", 'system');
        statusText.innerText = "Connection lost";
        showToast("DearMe could not respond right now. Try again.");
    } finally {
        // Restore controls
        chatInput.disabled = false;
        sendChatBtn.disabled = false;
        chatInput.focus();
    }
}

/**
 * Handle Enter key submissions inside chat input
 */
function handleChatKeydown(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

/**
 * Form resets to initial form input view
 */
function resetToForm() {
    const errorBanner = document.getElementById('errorBanner');
    const loader = document.getElementById('loadingOrchestrator');
    const result = document.getElementById('resultContainer');
    const form = document.getElementById('futureMeForm');
    
    errorBanner.style.display = 'none';
    loader.style.display = 'none';
    result.style.display = 'none';
    form.style.display = 'block';

    window.scrollTo({
        top: form.offsetTop - 120,
        behavior: 'smooth'
    });
}

/**
 * Focus and slide to Live chat section
 */
function startFutureMeChat(event) {
    event.preventDefault();
    const chatSection = document.getElementById('chat');
    
    window.scrollTo({
        top: chatSection.offsetTop - 80,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (!input.disabled) {
            input.focus();
        }
    }, 600);
}

/**
 * Copy results content markdown text block into clipboard
 */
function copyResultToClipboard() {
    if (!userProfile) {
        showToast("Generate a profile before copying!");
        return;
    }

    const manifesto = document.getElementById('outputManifesto').innerText;
    const identity = document.getElementById('outputIdentity').innerText;
    const moves = Array.from(document.querySelectorAll('#outputMoves li')).map((li, idx) => `${idx + 1}. ${li.innerText}`).join('\n');
    const habit = document.getElementById('outputHabit').innerText;
    const warning = document.getElementById('outputWarning').innerText;
    const mantra = document.getElementById('outputMantra').innerText;

    const formattedText = `🔮 DEARME REALITY BLUEPRINT 🔮
Name: ${userProfile.name}
Tone Selected: ${userProfile.tone}
One-Year Target: ${userProfile.oneYearVision}

✉️ A LETTER FROM DEARME:
${manifesto}

👤 FUTURE IDENTITY:
${identity}

🎯 NEXT 3 TACTICAL MOVES:
${moves}

🌱 HABIT TO START TODAY:
${habit}

⚠️ ROADBLOCK WARNING:
${warning}

🧘 DAILY MANTRA:
${mantra}

Generate your blueprint at DearMe.
`;

    navigator.clipboard.writeText(formattedText).then(() => {
        showToast("Your DearMe blueprint has been copied to the clipboard!");
    }).catch(err => {
        console.error("Clipboard copy failed:", err);
        showToast("Failed to copy. Please manually highlight and copy.");
    });
}

/**
 * Dynamic Dopamine Share Trigger
 */
function triggerShare() {
    if (userProfile) {
        copyResultToClipboard();
    } else {
        // Direct default sharing
        const promotionalText = `Check out DearMe, an AI-powered personal growth portal that lets you talk to the version of you who already made it.`;
        navigator.clipboard.writeText(promotionalText).then(() => {
            showToast("Promotional link copied to clipboard!");
        });
    }
}
