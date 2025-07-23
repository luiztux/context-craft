import { Link } from 'react-router-dom';
import { logo } from '../../assets/Assets';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { MoveDirection, OutMode } from '@tsparticles/engine';
import { useEffect, useMemo, useState } from 'react';
import { loadSlim } from '@tsparticles/slim';

export const Home = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async () => {};

  const options = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      interactivity: {
        events: { onHover: { enable: true, mode: 'repulse' } },
        modes: { repulse: { distance: 100, duration: 0.4 } },
      },
      particles: {
        color: { value: '#ffffff' },
        links: {
          color: '#ffffff',
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: { default: OutMode.bounce },
          random: false,
          speed: 2,
          straight: false,
        },
        number: { density: { enable: true }, value: 80 },
        opacity: { value: 0.2 },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 5 } },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <div className='relative flex items-center justify-center bg-gradient-to-br from-[#170305] to-[#0B1326] w-screen h-screen p-4 animated-gradient'>
      <Particles
        id='tsparticles'
        particlesLoaded={particlesLoaded}
        options={options}
        className='absolute top-0 left-0 w-full h-full'
      />
      <div className='relative z-10 w-full max-w-2xl p-8 space-y-12 text-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg'>
        <div className='flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6'>
          <img src={logo} alt='Logo Context Craft' className='w-20 md:w-24' />
          <h1 className='text-indigo-50 text-4xl md:text-5xl font-bold'>
            Context Craft
          </h1>
        </div>
        <div className='space-y-6 text-indigo-50'>
          <p className='text-xl md:text-2xl'>
            Visualize, teste e entenda a Context API do React — sem complicação.
          </p>
          <p className='text-lg md:text-xl font-light'>
            O ContextCraft é uma ferramenta interativa que mostra como o
            contexto funciona na prática. Veja o que renderiza, experimente
            erros comuns e aprenda de forma clara e divertida.
          </p>
        </div>
        <div>
          <Link
            to='/craft-playground'
            className='inline-block px-8 py-3 text-lg font-semibold text-white transition bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900'
            type='button'
          >
            Comece agora
          </Link>
        </div>
      </div>
    </div>