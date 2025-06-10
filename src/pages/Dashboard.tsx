
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, DollarSign, MapPin, Phone, CheckCircle, Star } from 'lucide-react';

const supabaseClient = {
  from: (table) => ({
    insert: async (data) => {
      console.log('Inserindo no Supabase:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { data: data, error: null };
    },
    select: async () => {
      return { data: [], error: null };
    }
  })
};

const servicos = [
  { 
    id: 'corte', 
    nome: 'Corte de Cabelo', 
    preco: 35, 
    duracao: 30,
    conflitos: ['cabelo_barba', 'completo'] 
  },
  { 
    id: 'barba', 
    nome: 'Barba', 
    preco: 25, 
    duracao: 20,
    conflitos: ['cabelo_barba', 'completo'] 
  },
  { 
    id: 'cabelo_barba', 
    nome: 'Cabelo + Barba', 
    preco: 55, 
    duracao: 45,
    conflitos: ['corte', 'barba', 'completo'] 
  },
  { 
    id: 'sobrancelha', 
    nome: 'Sobrancelha', 
    preco: 15, 
    duracao: 15,
    conflitos: ['completo'] 
  },
  { 
    id: 'hidratacao', 
    nome: 'Hidratação', 
    preco: 40, 
    duracao: 60,
    conflitos: ['completo'] 
  },
  { 
    id: 'completo', 
    nome: 'Pacote Completo', 
    preco: 80, 
    duracao: 90,
    conflitos: ['corte', 'barba', 'cabelo_barba', 'sobrancelha', 'hidratacao'] 
  }
];

const barbeiros = [
  { id: 'joao', nome: 'João Silva', especialidade: 'Rei da Tesourinha' },
  { id: 'rafael', nome: 'Rafael Santos', especialidade: 'Rei da Navalha' },
  { id: 'qualquer', nome: 'Qualquer barbeiro', especialidade: 'Disponível' }
];

const horarios = {
  manha: ['08:00', '09:00', '10:00', '11:00'],
  tarde: ['13:00', '14:00', '15:00', '16:00', '17:00'],
  noite: ['18:00', '19:00', '20:00', '21:00']
};

export default function AgendamentoBarbearia() {
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [dadosAgendamento, setDadosAgendamento] = useState(null);

  const obterDataAtual = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  useEffect(() => {
    setDataSelecionada(obterDataAtual());
  }, []);

  useEffect(() => {
    if (dataSelecionada && barbeiroSelecionado) {
      const ocupados = ['10:00', '14:00', '18:00'];
      setHorariosOcupados(ocupados);
    }
  }, [dataSelecionada, barbeiroSelecionado]);

  const podeSelecionarServico = (servicoId) => {
    const servico = servicos.find(s => s.id === servicoId);
    if (!servico) return false;

    if (servicosSelecionados.includes(servicoId)) return true;

    return !servicosSelecionados.some(idSelecionado => {
      const servicoSelecionado = servicos.find(s => s.id === idSelecionado);
      return servicoSelecionado?.conflitos?.includes(servicoId);
    });
  };

  const alternarServico = (servicoId) => {
    if (!podeSelecionarServico(servicoId)) return;

    setServicosSelecionados(prev => {
      if (prev.includes(servicoId)) {
        return prev.filter(id => id !== servicoId);
      } else {
        const servico = servicos.find(s => s.id === servicoId);
        const novosServicos = prev.filter(id => !servico?.conflitos?.includes(id));
        return [...novosServicos, servicoId];
      }
    });
  };

  const calcularTotal = () => {
    return servicosSelecionados.reduce((total, servicoId) => {
      const servico = servicos.find(s => s.id === servicoId);
      return total + (servico ? servico.preco : 0);
    }, 0);
  };

  const calcularDuracao = () => {
    return servicosSelecionados.reduce((total, servicoId) => {
      const servico = servicos.find(s => s.id === servicoId);
      return total + (servico ? servico.duracao : 0);
    }, 0);
  };

  const validarFormulario = () => {
    if (!dataSelecionada) return 'Selecione uma data';
    if (servicosSelecionados.length === 0) return 'Selecione pelo menos um serviço';
    if (!barbeiroSelecionado) return 'Escolha um barbeiro';
    if (!horarioSelecionado) return 'Selecione um horário';
    if (!nomeCliente.trim()) return 'Digite seu nome';
    if (!telefoneCliente.trim()) return 'Digite seu telefone';
    return null;
  };

  const enviarFormulario = async () => {
    const erro = validarFormulario();
    if (erro) {
      setMensagem(erro);
      return;
    }

    setCarregando(true);
    setMensagem('');

    try {
      const novosDadosAgendamento = {
        data: dataSelecionada,
        servicos: servicosSelecionados,
        barbeiro: barbeiroSelecionado,
        horario: horarioSelecionado,
        nome_cliente: nomeCliente.trim(),
        telefone_cliente: telefoneCliente.trim(),
        valor_total: calcularTotal(),
        duracao_total: calcularDuracao(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient.from('agendamentos').insert([novosDadosAgendamento]);

      if (error) {
        setMensagem('Erro ao agendar. Tente novamente.');
      } else {
        setDadosAgendamento(novosDadosAgendamento);
        setMostrarConfirmacao(true);
        setMensagem('Agendamento realizado com sucesso!');
      }
    } catch (err) {
      setMensagem('Erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const resetarFormulario = () => {
    setServicosSelecionados([]);
    setBarbeiroSelecionado('');
    setHorarioSelecionado('');
    setNomeCliente('');
    setTelefoneCliente('');
    setMostrarConfirmacao(false);
    setDadosAgendamento(null);
    setMensagem('');
  };

  const horarioIndisponivel = (horario) => {
    return horariosOcupados.includes(horario);
  };

  const renderizarHorarios = (periodo, slots) => (
    <div className="mb-6">
      <h4 className="text-white text-sm font-medium mb-3 capitalize">{periodo}</h4>
      <div className="grid grid-cols-4 gap-2">
        {slots.map(horario => (
          <button
            key={horario}
            onClick={() => setHorarioSelecionado(horario)}
            disabled={horarioIndisponivel(horario)}
            style={{
              backgroundColor: horarioSelecionado === horario 
                ? '#8B5A3C' 
                : horarioIndisponivel(horario)
                ? '#1A1A1A'
                : '#2E2C30'
            }}
            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              horarioSelecionado === horario
                ? 'text-white shadow-lg transform scale-105'
                : horarioIndisponivel(horario)
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:opacity-80 hover:transform hover:scale-105'
            }`}
          >
            {horario}
          </button>
        ))}
      </div>
    </div>
  );

  if (mostrarConfirmacao && dadosAgendamento) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: '#252225' }}>
        <div className="max-w-md mx-auto p-6">
          <div className="text-center mb-8 pt-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center animate-pulse" 
                   style={{ backgroundColor: '#8B5A3C' }}>
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                <span className="text-white text-xl">✓</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Agendamento Confirmado!</h1>
            <p className="text-gray-300">Seu horário foi reservado com sucesso</p>
          </div>

          <div className="rounded-2xl p-6 mb-6 shadow-2xl" 
               style={{ 
                 background: 'linear-gradient(135deg, #8B5A3C 0%, #6B4226 100%)',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Detalhes do Agendamento</h2>
              <Scissors className="w-6 h-6 text-white opacity-80" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-white opacity-80" />
                  <span className="text-white opacity-90">Data</span>
                </div>
                <span className="font-semibold text-white">
                  {new Date(dadosAgendamento.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-white opacity-80" />
                  <span className="text-white opacity-90">Horário</span>
                </div>
                <span className="font-semibold text-white">{dadosAgendamento.horario}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-white opacity-80" />
                  <span className="text-white opacity-90">Barbeiro</span>
                </div>
                <span className="font-semibold text-white">
                  {barbeiros.find(b => b.id === dadosAgendamento.barbeiro)?.nome}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3 text-white opacity-80" />
                  <span className="text-white opacity-90">Total</span>
                </div>
                <span className="font-bold text-2xl text-white">R$ {dadosAgendamento.valor_total},00</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#2E2C30' }}>
            <h3 className="font-semibold mb-4 text-white flex items-center">
              <Star className="w-5 h-5 mr-2" style={{ color: '#8B5A3C' }} />
              Serviços Contratados
            </h3>
            <div className="space-y-3">
              {dadosAgendamento.servicos.map(servicoId => {
                const servico = servicos.find(s => s.id === servicoId);
                return (
                  <div key={servicoId} className="flex justify-between items-center p-3 rounded-lg" 
                       style={{ backgroundColor: '#1A1A1A' }}>
                    <div>
                      <div className="font-medium text-white">{servico?.nome}</div>
                      <div className="text-sm text-gray-400">{servico?.duracao} min</div>
                    </div>
                    <div className="font-semibold text-white">R$ {servico?.preco},00</div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-600 mt-4 pt-4 flex justify-between items-center">
              <span className="font-semibold text-white">Duração Total:</span>
              <span className="font-bold text-white">{dadosAgendamento.duracao_total} minutos</span>
            </div>
          </div>

          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#2E2C30' }}>
            <h3 className="font-semibold mb-3 text-white">Informações Importantes</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Chegue 10 minutos antes do horário</p>
              <p>• Cancelamentos até 2h antes do horário</p>
              <p>• Você receberá uma confirmação via WhatsApp</p>
              <p>• Em caso de dúvidas, entre em contato conosco</p>
            </div>
          </div>

          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#2E2C30' }}>
            <h3 className="font-semibold mb-3 text-white">Dados do Cliente</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Nome:</span>
                <span className="font-medium text-white">{dadosAgendamento.nome_cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Telefone:</span>
                <span className="font-medium text-white">{dadosAgendamento.telefone_cliente}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetarFormulario}
              className="w-full py-4 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: '#8B5A3C' }}
            >
              FAZER NOVO AGENDAMENTO
            </button>
            
            <button
              onClick={() => window.open(`https://wa.me/5511934384114?text=Olá! Gostaria de confirmar meu agendamento para ${new Date(dadosAgendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${dadosAgendamento.horario}`, '_blank')}
              className="w-full py-3 rounded-xl font-medium text-white border-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{ borderColor: '#8B5A3C', backgroundColor: 'transparent' }}
            >
              ENTRAR EM CONTATO
            </button>
          </div>

          <div className="text-center pt-8">
            <div className="flex items-center justify-center mb-2">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-400">(11) 99999-9999</span>
            </div>
            <div className="flex items-center justify-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-400"> Estr. de Itapecerica, 5859</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#252225' }}>
      <div className="max-w-md mx-auto p-6 space-y-8">
        <div className="text-center pt-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8B5A3C' }}>
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Barbearia</h1>
          <p className="text-gray-400 text-sm">
            Agende seu horário e reserve seu momento de cuidado
          </p>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-3">
            Data
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Calendar className="w-5 h-5" style={{ color: '#8B5A3C' }} />
            </div>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              min={obterDataAtual()}
              className="w-full rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer focus:ring-orange-400"
              style={{ 
                backgroundColor: '#2E2C30', 
                border: '1px solid #3A3A3A'
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-4">Serviços</label>
          <div className="space-y-3">
            {servicos.map(servico => {
              const selecionado = servicosSelecionados.includes(servico.id);
              const podeSelecionar = podeSelecionarServico(servico.id);
              const desabilitado = !podeSelecionar && !selecionado;
              
              return (
                <button
                  key={servico.id}
                  onClick={() => alternarServico(servico.id)}
                  disabled={desabilitado}
                  style={{
                    backgroundColor: selecionado ? '#8B5A3C' : desabilitado ? '#1A1A1A' : '#2E2C30'
                  }}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 transform ${
                    selecionado
                      ? 'text-white shadow-lg scale-105'
                      : desabilitado
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : 'text-gray-300 hover:opacity-80 hover:scale-102'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{servico.nome}</div>
                      <div className="text-sm opacity-75">{servico.duracao} min</div>
                      {desabilitado && (
                        <div className="text-xs text-red-400 mt-1">
                          Não disponível com serviços selecionados
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">R$ {servico.preco}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {servicosSelecionados.length > 0 && (
          <div className="p-4 rounded-xl border-2" style={{ 
            backgroundColor: '#2E2C30',
            borderColor: '#8B5A3C'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" style={{ color: '#8B5A3C' }} />
                <span className="font-semibold">Total</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold" style={{ color: '#8B5A3C' }}>
                  R$ {calcularTotal()},00
                </div>
                <div className="text-sm text-gray-400">
                  {calcularDuracao()} minutos
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-white text-sm font-medium mb-4">
            <User className="w-4 h-4 inline mr-2" />
            Escolha seu barbeiro
          </label>
          <div className="space-y-3">
            {barbeiros.map(barbeiro => (
              <button
                key={barbeiro.id}
                onClick={() => setBarbeiroSelecionado(barbeiro.id)}
                style={{
                  backgroundColor: barbeiroSelecionado === barbeiro.id ? '#8B5A3C' : '#2E2C30'
                }}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 transform ${
                  barbeiroSelecionado === barbeiro.id
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-300 hover:opacity-80 hover:scale-102'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{barbeiro.nome}</div>
                    <div className="text-sm opacity-75">{barbeiro.especialidade}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-4">
            <Clock className="w-4 h-4 inline mr-2" />
            Horários disponíveis
          </label>
          {renderizarHorarios('Manhã', horarios.manha)}
          {renderizarHorarios('Tarde', horarios.tarde)}
          {renderizarHorarios('Noite', horarios.noite)}
        </div>

        <div className="space-y-4">
          <h3 className="text-white text-sm font-medium">Seus dados</h3>
          
          <input
            type="text"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            style={{ 
              backgroundColor: '#2E2C30', 
              borderColor: '#2E2C30'
            }}
          />
          
          <input
            type="tel"
            value={telefoneCliente}
            onChange={(e) => setTelefoneCliente(e.target.value)}
            placeholder="Seu telefone (WhatsApp)"
            className="w-full rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            style={{ 
              backgroundColor: '#2E2C30', 
              borderColor: '#2E2C30'
            }}
          />
        </div>

        {mensagem && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            mensagem.includes('sucesso') 
              ? 'bg-green-800 bg-opacity-50 text-green-200 border border-green-600' 
              : 'bg-red-800 bg-opacity-50 text-red-200 border border-red-600'
          }`}>
            {mensagem}
          </div>
        )}

        <button
          onClick={enviarFormulario}
          disabled={carregando}
          style={{
            backgroundColor: carregando ? '#6b7280' : '#8B5A3C'
          }}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 transform ${
            carregando
              ? 'cursor-not-allowed'
              : 'hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg'
          }`}
        >
          {carregando ? 'AGENDANDO...' : `AGENDAR - R$ ${calcularTotal()},00`}
        </button>

        {servicosSelecionados.length > 0 && barbeiroSelecionado && horarioSelecionado && (
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#2E2C30' }}>
            <h3 className="font-bold mb-4 text-lg">Resumo do Agendamento</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Data:</span>
                <span className="font-medium">{new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Horário:</span>
                <span className="font-medium">{horarioSelecionado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Barbeiro:</span>
                <span className="font-medium">{barbeiros.find(b => b.id === barbeiroSelecionado)?.nome}</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="text-sm text-gray-300 mb-2">Serviços:</div>
                {servicosSelecionados.map(servicoId => {
                  const servico = servicos.find(s => s.id === servicoId);
                  return (
                    <div key={servicoId} className="flex justify-between text-sm">
                      <span>{servico?.nome}</span>
                      <span>R$ {servico?.preco},00</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-600 pt-3 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span style={{ color: '#8B5A3C' }}>R$ {calcularTotal()},00</span>
              </div>
              {nomeCliente && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Cliente:</span>
                  <span className="font-medium">{nomeCliente}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center pt-6 border-t border-gray-700">
          <div className="flex items-center justify-center mb-2">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm text-gray-400">(11) 99999-9999</span>
          </div>
          <p className="text-xs text-gray-500">
            Cancelamentos até 2h antes do horário
          </p>
        </div>
      </div>
    </div>
  );
}
