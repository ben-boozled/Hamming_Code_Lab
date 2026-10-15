<script>
    // Easter egg! A pig (ham, get it?) that leaps out from the bottom of the screen!
    let { onclose = () => {} } = $props();
</script>

<!-- Explore the geometrical properties of a cute pig! -->
<button class="pig" type="button" onclick={onclose} aria-label="A pig says oink! Click to dismiss.">
    <span class="bubble">Oink! Did someone say Hamming? :O</span>
    <svg class="art" viewBox="0 0 220 170" aria-hidden="true">
        <!-- Tail (drawn using quadratic Bézier curves) -->
        <path d="M44 100 q-20 -6 -10 -22 q10 -12 18 -2 q-6 9 4 12" fill="none" stroke="#c9657f" stroke-width="5" stroke-linecap="round"/>

        <!-- Back Legs (drawn using rounded rectangles) -->
        <g class="legs-back">
            <!-- The back trotters -->
            <rect x="58" y="128" width="18" height="30" rx="8" fill="#f09cb1" stroke="#c9657f" stroke-width="2.5"/>
            <rect x="84" y="132" width="18" height="30" rx="8" fill="#f09cb1" stroke="#c9657f" stroke-width="2.5"/>
            <!-- The fabulous toes -->
            <rect x="58" y="150" width="18" height="9" rx="4" fill="#9c4560"/>
            <rect x="84" y="154" width="18" height="9" rx="4" fill="#9c4560"/>
        </g>

        <!-- Body (chonky and surprisingly easy to draw) -->
         <ellipse cx="108" cy="104" rx="68" ry="44" fill="#f8aabd" stroke="#c9657f" stroke-width="3"/>

        <!-- Front Legs (drawn using rounded rectangles) -->
        <g class="legs-front">
           <!-- The front trotters -->
           <rect x="118" y="132" width="18" height="30" rx="8" fill="#f09cb1" stroke="#c9657f" stroke-width="2.5"/>
           <rect x="144" y="128" width="18" height="30" rx="8" fill="#f09cb1" stroke="#c9657f" stroke-width="2.5"/>
           <!-- The second set of fabulous toes -->
           <rect x="118" y="154" width="18" height="9" rx="4" fill="#9c4560"/>
           <rect x="144" y="150" width="18" height="9" rx="4" fill="#9c4560"/>
        </g>

        <!-- Ears -->
        <polygon points="146,64 154,36 172,60" fill="#f09cb1" stroke="#c9657f" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="176,60 196,40 200,72" fill="#f09cb1" stroke="#c9657f" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="153,58 156,46 164,58" fill="#e17a95"/>
        <polygon points="182,60 193,48 194,66" fill="#e17a95"/>

        <!-- Head -->
        <circle cx="168" cy="88" r="34" fill="#fab7c6" stroke="#c9657f" stroke-width="3"/>

        <!-- Snout (Important! Up to this point, the pig just looks like a chonky, faceless pink cat) -->
        <ellipse cx="188" cy="98" rx="17" ry="13" fill="#f48fa6" stroke="#c9657f" stroke-width="3"/>
        <ellipse cx="183" cy="98" rx="2.8" ry="4.5" fill="8a3550"/>
        <ellipse cx="194" cy="98" rx="2.8" ry="4.5" fill="8a3550"/>

        <!-- Eye + cheeck + smile -->
        <circle cx="166" cy="80" r="5" fill="#2a2230"/>
        <circle cx="167.6" cy="78.4" r="1.7" fill="#ffffff"/>  <!-- these eye whites are a necessary kawaii factor; without them, your pig will need an exorcism -->
        <circle cx="158" cy="100" r="6.5" fill="#f2708f" opacity="0.5"/> <!-- for extra kawaii-ness-->
        <path d="M174 112 q9 7 18 0" fill="none" stroke="#8a3550" stroke-width="2.5" stroke-linecap="round"/> <!-- even more kawaii-ness-->
    </svg>
</button>

<style>
    .pig{
        position: fixed;
        left: 50%;
        bottom: -12px;
        z-index: 50;
        width: min(240px, 60vw);
        padding: 0;
        border: 0;
        background: none;
        cursor: pointer;
        transform: translate(-50%, 115%);
        animation: leap 4.2s both;
    }
    .art { display: block; width: 100%; height: auto; animation: wiggle 0.45s ease-in-out 8 alternate; transform-origin: 50% 90%; }
    .legs-back, .legs-front { transform-box: fill-box; transform-origin: 50% 0; }
    .legs-back { animation: kick 0.45s ease-in-out 8 alternate; }
    .legs-front { animation: kick 0.45s ease-in-out 8 alternate-reverse; }

    .bubble {
        position: absolute;
        left: 50%;
        bottom: calc(100% - 6px);
        transform: translateX(-50%);
        white-space: nowrap;
        padding: 0.45rem 0.8rem;
        border-radius: 12px;
        background: #ffffff;
        color: #2a2230;
        font: 600 0.9rem var(--sans);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        animation: bubble 0.25s 1.3s both;
    }
    .bubble::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 100%;
        margin-left: -7px;
        border: 7px solid transparent;
        border-top-color: #ffffff;
    }

    /* Animations */
    @keyframes leap {
        0%    { transform: translate(-50%, 115%) rotate(0deg); animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1); }
        13%   { transform: translate(-50%, -250%) rotate(-12deg); animation-timing-function: ease-in; }
        24%   { transform: translate(-50%, -8%) rotate(4deg); animation-timing-function: ease-out; }
        30%   { transform: translate(-50%, -95%) rotate(-3deg); animation-timing-function: ease-in; }
        36%   { transform: translate(-50%, -8%) rotate(0deg); }
        88%   { transform: translate(-50%, -8%) rotate(0deg); animation-timing-function: ease-in; }
        100%  { transform: translate(-50%, 120%) rotate(0deg); }
    }
    @keyframes wiggle { from { transform: rotate(-2.5deg); } to { transform: rotate(2.5deg); } }
    @keyframes kick { from { transform: rotate(-9deg); } to { transform: rotate(9deg); } }
    @keyframes bubble { from { opacity: 0; transform: translateX(-50%) scale(0.85); } to { opacity: 1; transform: translateX(-50%) scale(1); } }

    @media (prefers-reduced-motion: reduce) {
        .pig { animation: fade 3.6s both; transform: translate(-50%, -8%); }
        .art, .legs-back, .legs-front { animation: none; } 
        .bubble  { animation: none; } 
        @keyframes fade { 0%, 100% { opacity: 0; } 10%, 85% { opacity: 1; } }
    }
</style>