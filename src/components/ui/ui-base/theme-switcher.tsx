// components/ThemeSwitcher.js
import { useEffect, useState } from 'react';
import { FaMoon } from 'react-icons/fa';

interface Props {
  className: string
}

export default function ThemeSwitcher({ className }: Props) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('lessonlab-theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.add(storedTheme);
    } else {
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('lessonlab-theme', newTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
  };

  return (
    <div className={className} onClick={toggleTheme}>
      <FaMoon />
    </div>
  );
}
