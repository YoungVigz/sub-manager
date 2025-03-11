"use client"

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}: FooterProps) => {

    function getCurrentYear(): string {
        const currentYear: string = new Date().getFullYear().toString();
        
        return currentYear;
    }

    return (
        <footer className="flex justify-center items-center">
            Made with love &#9829; by Gabriel Gałęza &copy; {getCurrentYear()}
        </footer>
    )
}

export default Footer; 