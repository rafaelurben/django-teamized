export interface Alert {
    title: string;
    text: string;
    html?: string;
    timer?: number;
    showConfirmButton?: boolean;
    toast?: boolean;
    position?: string;
    allowOutsideCLick?: boolean;
    allowEscapeKey?: boolean;
}
