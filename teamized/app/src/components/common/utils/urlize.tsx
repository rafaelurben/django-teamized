import React from 'react';

interface Props {
    text: string;
    preserveLineBreaks?: boolean;
}

export default function Urlize({ text, preserveLineBreaks = true }: Props) {
    const urlRegex = /((?:https?:\/\/|www\.)[^\s/$.?#].\S*)/gi;

    const parts = text.split(urlRegex);

    return (
        <span
            style={{ whiteSpace: preserveLineBreaks ? 'pre-wrap' : 'normal' }}
        >
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    const href = part.startsWith('http')
                        ? part
                        : `https://${part}`;
                    return (
                        <a
                            key={index}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {part}
                        </a>
                    );
                } else {
                    return part;
                }
            })}
        </span>
    );
}
