"use client"

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}: FooterProps) => {

    function getCurrentYear(): string {
        const currentYear: string = new Date().getFullYear().toString();
        
        return currentYear;
    }

    return (
        <footer className="justify-center items-center hidden md:flex text-sm md:text-base lg:text-lg">
            Made with love &#9829; by Gabriel Gałęza &copy; {getCurrentYear()}
        </footer>
    )
}

export default Footer; 