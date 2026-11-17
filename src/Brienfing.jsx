import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './index.css'

const TO = 'contato@criaesolucoes.com.br';
const PAGES = ['Início', 'Sobre nós', 'Serviços', 'Portfólio', 'Depoimentos', 'Blog', 'Contato'];
const FUNCS = ['Botão WhatsApp', 'Formulário de contato', 'Redes sociais', 'Agendamento online', 'Loja virtual', 'Área do cliente'];
const OBJ = ['Apresentar a empresa e passar credibilidade', 'Captar contatos e orçamentos', 'Vender produtos online', 'Divulgar uma campanha ou lançamento', 'Outro'];
const LOGO = ['Sim, tenho logo e identidade completa', 'Tenho só o logotipo', 'Ainda não tenho'];
const TXT = ['Sim, tenho tudo', 'Tenho uma parte', 'Preciso de ajuda com isso'];
const DOM = ['Já tenho domínio e hospedagem', 'Tenho só o domínio', 'Ainda não tenho'];

export default function BriefingForm() {
  const [D, setD] = useState({
    empresa: '', nome: '', ddi: '+55', zap: '', email: '', segmento: '',
    oferta: '', objetivo: '', paginas: [], funcs: [], ref: '', logo: '',
    cores: '', txt: '', dom: '', prazo: '', naosei: false, obs: ''
  });

  const [errs, setErrs] = useState([]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2400);
  };

  const filled = () => {
    const v = k => String(D[k]).trim();
    return [
      v('empresa'), v('nome'), v('zap'), v('email'), v('segmento'),
      v('oferta'), v('objetivo'), D.paginas.length, D.funcs.length,
      v('ref'), v('logo'), v('cores'), v('txt'), v('dom'),
      (D.prazo || D.naosei) ? 1 : '', v('obs')
    ].filter(Boolean).length;
  };

  const fCount = filled();
  const p = Math.round((fCount / 16) * 100);

  const handleChange = (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    const val = e.target.value;
    setD(prev => ({
      ...prev,
      [k]: val,
      ...(k === 'prazo' ? { naosei: false } : {})
    }));
    setErrs(prev => prev.filter(x => x !== k));
  };

  const handleChip = (key, value) => {
    setD(prev => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter(x => x !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleNaosei = () => {
    setD(prev => ({
      ...prev,
      naosei: !prev.naosei,
      prazo: !prev.naosei ? '' : prev.prazo
    }));
  };

  const generateTxt = () => {
    const L = (a, b) => `${a}: ${b || '—'}`;
    return [
      'NOVO BRIEFING DE SITE | CRIAÊ', '',
      '1. SOBRE A EMPRESA',
      L('Empresa', D.empresa),
      L('Nome', D.nome),
      L('WhatsApp', D.zap && D.ddi + ' ' + D.zap),
      L('E-mail', D.email),
      L('Segmento', D.segmento),
      L('Oferece / para quem', D.oferta), '',
      '2. O QUE O SITE PRECISA FAZER',
      L('Objetivo', D.objetivo),
      L('Páginas', D.paginas.join(', ')),
      L('Funcionalidades', D.funcs.join(', ')),
      L('Site que admira', D.ref), '',
      '3. VISUAL, CONTEÚDO E PRAZO',
      L('Logo e identidade', D.logo),
      L('Cores / estilo', D.cores),
      L('Textos e fotos', D.txt),
      L('Domínio e hospedagem', D.dom),
      L('Prazo', D.naosei ? 'Não sei dizer' : (D.prazo ? D.prazo.split('-').reverse().join('/') : '—')),
      L('Observações', D.obs)
    ].join('\n');
  };

  const handleCopy = () => {
    
    const text = generateTxt();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast('Resumo copiado!'));
    } else {
      showToast('Selecione o texto e copie manualmente');
    }
  };

  const handleSend = () => {

    const requiredKeys = ['empresa', 'nome', 'zap', 'segmento', 'objetivo'];
    const missing = requiredKeys.filter(k => !String(D[k]).trim());
    
    if (missing.length > 0) {
      setErrs(missing);
      showToast('Preencha os campos obrigatórios (*)');
      setTimeout(() => {
        const firstErr = document.querySelector('.err');
        firstErr && firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    setLoading(true);

    const templateParams = {
      to_email: TO,
      from_name: D.nome,
      empresa: D.empresa,
      message: generateTxt()
    };
    const SERVICE_ID = import.meta.env.VITE_SERVICE_ID
    const TEMPLATE_ID = import.meta.env.VITE_TEMPLATE_ID
    const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY
    // Substitua pelos seus dados do EmailJS
  emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        setLoading(false);
        setSent(true);
        window.scrollTo(0, 0);
        showToast('Briefing enviado com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao enviar:', error);
        setLoading(false);
        showToast('Erro ao enviar. Tente novamente.');
      });
  };

  return (
    <div id="app" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Toast Notification */}
      <div id="t" style={{
        position: 'fixed', bottom: '20px', right: '20px', background: '#333', color: '#fff',
        padding: '10px 20px', borderRadius: '4px', transition: 'opacity 0.3s',
        opacity: toastShow ? 1 : 0, pointerEvents: 'none', zIndex: 1000
      }}>
        {toastMessage}
      </div>

      {sent ? (
        <div className="card done" style={{  padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div className="n" style={{ fontSize: '40px', color: '#10b981', marginBottom: '10px' }}>✓</div>
          <h2 >Briefing enviado com sucesso!</h2>
          <p >Recebemos as informações da <b>{D.empresa}</b>. Entraremos em contato em breve através do seu WhatsApp.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleCopy}>Copiar resumo para mim</button>
            <button className="btn" onClick={() => { setSent(false); }} >Preencher outro briefing</button>
          </div>
        </div>
      ) : (
        <>
          <div className="brand" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div className="logo">
              <b style={{ fontSize: '24px' }}>criaê</b>
              <small style={{ display: 'block', fontSize: '10px', color: '#888', letterSpacing: '1px' }}>TECNOLOGIA • DESIGN • DIGITAL</small>
            </div>
          </div>
          
          <h1 style={{ textAlign: 'center', fontSize: '28px' }}>Vamos tirar seu site do papel?</h1>
          <p className="sub" style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>São só 16 perguntas rápidas, em torno de 5 minutos. Com elas a CRIAÊ entende o seu negócio e já monta uma proposta de site para você.</p>
          
          {/* Barra de Progresso */}
          <div className="card prog" style={{  padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div className="r" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>{fCount} de 16 campos preenchidos</span>
              <span style={{ color: '#666' }}>{p}%</span>
            </div>
            <div className="bar" style={{ background: '#eee', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <i id="pb" style={{ display: 'block', height: '100%', width: `${p}%`, background: '#2563eb', transition: 'width 0.3s' }}></i>
            </div>
          </div>

          {/* Seção 01 */}
          <div className="card" style={{  padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div className="sh" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div className="n" >01</div>
              <div>
                <h2 style={{ margin: '0 0 5px', fontSize: '18px' }}>Sobre você e sua empresa</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Para conhecermos o seu negócio.</p>
              </div>
            </div>
            <div className="g" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="l" >Nome da empresa <i style={{ color: 'red' }}>*</i></label>
                <input className={`f ${errs.includes('empresa') ? 'err' : ''}`} data-k="empresa" value={D.empresa} onChange={handleChange} placeholder=""  />
              </div>
              <div>
                <label className="l" >Seu nome <i style={{ color: 'red' }}>*</i></label>
                <input className={`f ${errs.includes('nome') ? 'err' : ''}`} data-k="nome" value={D.nome} onChange={handleChange} placeholder=""  />
              </div>
              <div>
                <label className="l" >WhatsApp <i style={{ color: 'red' }}>*</i></label>
                <div className="ph" style={{ display: 'flex', gap: '10px' }}>
                  <select className="f" data-k="ddi" value={D.ddi} onChange={handleChange} >
                    <option value="+55">Brasil (+55)</option>
                    <option value="+351">Portugal (+351)</option>
                    <option value="+1">Eua (+1)</option>
                    <option value="">OUTRO</option>
                  </select>
                  <input className={`f ${errs.includes('zap') ? 'err' : ''}`} data-k="zap" value={D.zap} onChange={handleChange} placeholder="(31) 90000-0000" inputMode="tel" />
                </div>
              </div>
              <div>
                <label className="l" >E-mail <em style={{ color: '#888', fontWeight: 'normal' }}>(opcional)</em></label>
                <input className="f" data-k="email" type="email" value={D.email} onChange={handleChange} placeholder="voce@empresa.com.br"  />
              </div>
              <div>
                <label className="l" >Segmento de atuação <i style={{ color: 'red' }}>*</i></label>
                <input className={`f ${errs.includes('segmento') ? 'err' : ''}`} data-k="segmento" value={D.segmento} onChange={handleChange} placeholder="clínica, loja, consultoria..."  />
              </div>
              <div>
                <label className="l" >O que você oferece e para quem? <em style={{ color: '#888', fontWeight: 'normal' }}>(opcional)</em></label>
                <textarea className="f" data-k="oferta" value={D.oferta} onChange={handleChange} ></textarea>
              </div>
            </div>
          </div>

          {/* Seção 02 */}
          <div className="card" style={{  padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div className="sh" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div className="n">02</div>
              <div>
                <h2 style={{ margin: '0 0 5px', fontSize: '18px' }}>O que o site precisa fazer</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Escolha o que imagina para o projeto.</p>
              </div>
            </div>
            <div className="g" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="l" >Principal objetivo do site <i style={{ color: 'red' }}>*</i></label>
                <select className={`f ${errs.includes('objetivo') ? 'err' : ''}`} data-k="objetivo" value={D.objetivo} onChange={handleChange} >
                  <option value="">Selecione uma opção</option>
                  {OBJ.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label className="l" >Páginas desejadas</label>
                <div className="chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PAGES.map(x => (
                    <button key={x} type="button" className={`chip ${D.paginas.includes(x) ? 'on' : ''}`} onClick={() => handleChip('paginas', x)} >{x}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="l" >Funcionalidades</label>
                <div className="chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {FUNCS.map(x => (
                    <button key={x} type="button" className={`chip ${D.funcs.includes(x) ? 'on' : ''}`} onClick={() => handleChip('funcs', x)} >{x}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="l" >Algum site que você admira? Cole o link <em style={{ color: '#888', fontWeight: 'normal' }}>(opcional)</em></label>
                <input className="f" data-k="ref" value={D.ref} onChange={handleChange} placeholder="https://"  />
              </div>
            </div>
          </div>

          {/* Seção 03 */}
          <div className="card" style={{  padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div className="sh" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div className="n">03</div>
              <div>
                <h2 style={{ margin: '0 0 5px', fontSize: '18px' }}>Visual, conteúdo e prazo</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Últimos detalhes para alinharmos.</p>
              </div>
            </div>
            <div className="g" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="l" >Já tem logo e identidade visual?</label>
                <select className="f" data-k="logo" value={D.logo} onChange={handleChange} >
                  <option value="">Selecione uma opção</option>
                  {LOGO.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label className="l" >Cores ou estilo preferido</label>
                <input className="f" data-k="cores" value={D.cores} onChange={handleChange} placeholder="moderno, clean, escuro"  />
              </div>
              <div>
                <label className="l" >Já tem textos e fotos?</label>
                <select className="f" data-k="txt" value={D.txt} onChange={handleChange} >
                  <option value="">Selecione uma opção</option>
                  {TXT.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label className="l" >Domínio e hospedagem</label>
                <select className="f" data-k="dom" value={D.dom} onChange={handleChange} >
                  <option value="">Selecione uma opção</option>
                  {DOM.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label className="l" >Prazo desejado para publicar</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input className="f" type="date" data-k="prazo" value={D.prazo} onChange={handleChange}  />
                  <button type="button" className={`chip ${D.naosei ? 'on' : ''}`} onClick={handleNaosei} >Não sei dizer</button>
                </div>
              </div>
              <div>
                <label className="l" >Algo mais que a gente deve saber?</label>
                <textarea className="f" data-k="obs" value={D.obs} onChange={handleChange} ></textarea>
              </div>
            </div>
          </div>

          <button className="send" onClick={handleSend} disabled={loading} >
            {loading ? 'Enviando...' : 'Enviar briefing'}
          </button>
        </>
      )}
    </div>
  );
}