import { useId } from "react";

export default function Avatar({
  small = false,
  className = "",
}) {
  const id = useId().replace(/:/g, "");

  const ids = {
    background: `${id}-background`,
    skin: `${id}-skin`,
    neck: `${id}-neck`,
    hair: `${id}-hair`,
    jacket: `${id}-jacket`,
    shirt: `${id}-shirt`,
    clip: `${id}-clip`,
  };

  return (
    <span
      aria-hidden="true"
      className={[
        "relative inline-flex shrink-0 overflow-hidden rounded-full",
        "bg-[#F7F4EE]",
        small
          ? "h-12 w-12 sm:h-14 sm:w-14"
          : "h-10 w-10 sm:h-11 sm:w-11",
        className,
      ].join(" ")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 240"
        fill="none"
        className="block h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={ids.background}
            x1="30"
            y1="10"
            x2="210"
            y2="240"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFCF6" />
            <stop offset="1" stopColor="#E8EAF0" />
          </linearGradient>

          <linearGradient
            id={ids.skin}
            x1="88"
            y1="65"
            x2="153"
            y2="164"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFDCBC" />
            <stop offset="0.55" stopColor="#F3BD98" />
            <stop offset="1" stopColor="#E7A783" />
          </linearGradient>

          <linearGradient
            id={ids.neck}
            x1="110"
            y1="143"
            x2="132"
            y2="193"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D99573" />
            <stop offset="0.55" stopColor="#F0B491" />
            <stop offset="1" stopColor="#F8C9A7" />
          </linearGradient>

          <linearGradient
            id={ids.hair}
            x1="78"
            y1="24"
            x2="162"
            y2="104"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#514139" />
            <stop offset="0.5" stopColor="#352C29" />
            <stop offset="1" stopColor="#241F20" />
          </linearGradient>

          <linearGradient
            id={ids.jacket}
            x1="59"
            y1="169"
            x2="177"
            y2="244"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#344C69" />
            <stop offset="1" stopColor="#192C45" />
          </linearGradient>

          <linearGradient
            id={ids.shirt}
            x1="111"
            y1="174"
            x2="128"
            y2="226"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFCF4" />
            <stop offset="1" stopColor="#E7E5E2" />
          </linearGradient>

          <clipPath id={ids.clip}>
            <circle cx="120" cy="120" r="120" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${ids.clip})`}>
          {/* Background */}
          <path
            d="M0 0h240v240H0z"
            fill={`url(#${ids.background})`}
          />

          <circle
            cx="120"
            cy="107"
            r="89"
            fill="#FFFFFF"
            fillOpacity="0.46"
          />

          {/* Back of hairstyle */}
          <path
            d="
              M66 98
              C56 80 55 58 65 41
              C76 21 98 15 119 19
              C143 8 168 22 177 43
              C185 62 180 84 170 104
              L159 122
              H78
              Z
            "
            fill="#2D2625"
          />

          {/* Shoulders */}
          <path
            d="
              M15 244
              L23 208
              C27 191 40 183 59 177
              L94 164
              H146
              L181 177
              C200 183 213 191 217 208
              L225 244
              Z
            "
            fill={`url(#${ids.jacket})`}
            stroke="#192A40"
            strokeWidth="2"
          />

          {/* Neck */}
          <path
            d="
              M101 141
              H139
              V169
              L149 178
              L120 210
              L91 178
              L101 169
              Z
            "
            fill={`url(#${ids.neck})`}
          />

          {/* Chin shadow */}
          <path
            d="
              M101 145
              Q120 160 139 145
              V154
              Q122 168 101 156
              Z
            "
            fill="#C98465"
            fillOpacity="0.42"
          />

          {/* Inner shirt */}
          <path
            d="
              M96 169
              L120 191
              L144 169
              L153 186
              L120 230
              L87 186
              Z
            "
            fill={`url(#${ids.shirt})`}
          />

          {/* Ears */}
          <path
            d="
              M76 91
              C62 83 62 104 69 115
              Q73 121 80 118
              L84 102
              Z
            "
            fill="#EDAD89"
            stroke="#D69575"
            strokeWidth="1.3"
          />

          <path
            d="
              M164 91
              C178 83 178 104 171 115
              Q167 121 160 118
              L156 102
              Z
            "
            fill="#EDAD89"
            stroke="#D69575"
            strokeWidth="1.3"
          />

          <path
            d="M71 98q-2 8 5 13"
            stroke="#CA8266"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M169 98q2 8-5 13"
            stroke="#CA8266"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Face */}
          <path
            d="
              M77 70
              C78 45 96 35 120 35
              C145 35 163 48 164 73
              L162 113
              C160 134 143 157 120 161
              C97 157 80 134 78 113
              Z
            "
            fill={`url(#${ids.skin})`}
            stroke="#D99A78"
            strokeWidth="1.4"
          />

          {/* Face shading */}
          <path
            d="
              M155 74
              Q166 113 149 138
              Q136 155 120 161
              Q145 158 159 133
              Q168 113 164 78
              Z
            "
            fill="#D99372"
            fillOpacity="0.23"
          />

          {/* Cheeks */}
          <ellipse
            cx="90"
            cy="119"
            rx="12"
            ry="6"
            fill="#E78B7D"
            fillOpacity="0.19"
          />

          <ellipse
            cx="150"
            cy="119"
            rx="12"
            ry="6"
            fill="#E78B7D"
            fillOpacity="0.19"
          />

          {/* Swept hairstyle */}
          <path
            d="
              M69 91
              C59 75 59 54 69 39
              C79 23 96 18 112 21
              C129 12 151 18 163 30
              C178 44 178 65 166 83
              L161 96
              L155 77
              C151 72 148 66 146 57
              C136 74 121 81 102 78
              C91 76 84 77 80 84
              L78 100
              Z
            "
            fill={`url(#${ids.hair})`}
            stroke="#2C2523"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Main hair swoop */}
          <path
            d="
              M78 60
              C85 41 103 42 118 43
              C133 44 145 37 147 28
              C154 43 149 58 137 65
              C123 73 105 69 94 69
              Q84 69 78 76
            "
            fill="#59473D"
            fillOpacity="0.65"
          />

          {/* Hair highlights */}
          <path
            d="M75 52Q84 31 108 32"
            stroke="#796052"
            strokeOpacity="0.57"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M88 58c18-10 35 5 51-13"
            stroke="#94715B"
            strokeOpacity="0.34"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          <path
            d="M158 39q12 17 2 33"
            stroke="#796052"
            strokeOpacity="0.4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M68 66q-1 12 5 19"
            stroke="#786052"
            strokeOpacity="0.4"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Eyebrows */}
          <path
            d="M85 88q12-7 23-1"
            stroke="#49362D"
            strokeWidth="3.7"
            strokeLinecap="round"
          />

          <path
            d="M132 87q11-6 23 1"
            stroke="#49362D"
            strokeWidth="3.7"
            strokeLinecap="round"
          />

          {/* Eye whites */}
          <path
            d="M85 103q10-12 22 0-11 10-22 0Z"
            fill="#FFFAF3"
          />

          <path
            d="M133 103q11-12 22 0-11 10-22 0Z"
            fill="#FFFAF3"
          />

          {/* Irises */}
          <ellipse
            cx="97"
            cy="102"
            rx="5.6"
            ry="7"
            fill="#76503A"
          />

          <ellipse
            cx="143"
            cy="102"
            rx="5.6"
            ry="7"
            fill="#76503A"
          />

          {/* Pupils */}
          <ellipse
            cx="97.5"
            cy="102"
            rx="3"
            ry="4.8"
            fill="#292326"
          />

          <ellipse
            cx="142.5"
            cy="102"
            rx="3"
            ry="4.8"
            fill="#292326"
          />

          {/* Eye highlights */}
          <circle cx="99" cy="99" r="1.9" fill="#FFFFFF" />
          <circle cx="144" cy="99" r="1.9" fill="#FFFFFF" />

          {/* Upper eyelids */}
          <path
            d="M85 102q10-10 22 0"
            stroke="#49362E"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M133 102q11-10 22 0"
            stroke="#49362E"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Glasses arms */}
          <path
            d="M72 96 80 99M160 99l8-3"
            stroke="#343139"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Glasses lenses */}
          <circle
            cx="96"
            cy="104"
            r="18"
            fill="#FFFFFF"
            fillOpacity="0.055"
            stroke="#343139"
            strokeWidth="3.4"
          />

          <circle
            cx="144"
            cy="104"
            r="18"
            fill="#FFFFFF"
            fillOpacity="0.055"
            stroke="#343139"
            strokeWidth="3.4"
          />

          {/* Glasses bridge */}
          <path
            d="M114 101q6-5 12 0"
            stroke="#343139"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Lens reflections */}
          <path
            d="m84 100 6-7M132 100l6-7"
            stroke="#FFFFFF"
            strokeOpacity="0.6"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Nose */}
          <path
            d="M119 107 116 121q4 3 8 0"
            stroke="#CD8C6D"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Smile */}
          <path
            d="M108 135q12 8 24-1"
            stroke="#985D4E"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          <path
            d="M114 142q6 2 12 0"
            stroke="#FFDCC2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />

          {/* Left jacket lapel */}
          <path
            d="
              M94 166
              L120 207
              L108 240
              H83
              L75 187
              Z
            "
            fill="#304762"
            stroke="#21364E"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          <path
            d="m94 166-9 29 19 7-10 12 14 26"
            stroke="#48607B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Right jacket lapel */}
          <path
            d="
              M146 166
              L120 207
              L108 240
              H157
              L165 187
              Z
            "
            fill="#263D58"
            stroke="#1F324A"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          <path
            d="m146 166 9 29-19 7 10 12-23 26"
            stroke="#415975"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Shoulder seams */}
          <path
            d="m55 181 9 59M185 181l-9 59"
            stroke="#182B42"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Jacket pocket detail */}
          <path
            d="M160 220h20"
            stroke="#536A81"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}