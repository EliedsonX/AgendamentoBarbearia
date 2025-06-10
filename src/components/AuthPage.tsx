
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>

      {/* Lado direito - Imagem da barbearia */}
      <div className="hidden lg:flex flex-1 relative">
        <div 
          className="w-full bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/Uploads/Barbearia.png')`
          }}
        >
          {/* Overlay escuro para melhor legibilidade */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Conteúdo sobre a imagem */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                {isLogin ? 'LOGIN' : 'CADASTRO'}
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            </div>
            
            <div className="max-w-md">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Barber Shop
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Agende seu horário com os melhores profissionais da cidade. 
                Experiência única em cortes e cuidados masculinos.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
