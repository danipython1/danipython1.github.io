/* LD11 – kontaktų formos apdorojimas ir validacija */
(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fields = [...form.querySelectorAll('input')];
  const send = document.getElementById('send-button');
  const clear = document.getElementById('clear-button');
  const phone = form.elements.telefonas;
  const result = document.getElementById('form-result');
  const values = document.getElementById('result-values');
  const average = document.getElementById('result-average');
  const touched = new Set();

  // Leidžiami skaitmenys, o šalies kodas ir tarpai pridedami automatiškai.
  function formatPhone() {
    let digits = phone.value.replace(/\D/g, '');
    if (digits.startsWith('370')) digits = digits.slice(3);
    else if (digits.startsWith('8') || digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0, 8);
    phone.value = digits ? '+370 ' + digits.slice(0, 3) + (digits.length > 3 ? ' ' + digits.slice(3) : '') : '';
  }
  function errorFor(field) {
    const value = field.value.trim();
    if (!value) return 'Šis laukas privalomas.';
    switch (field.name) {
      case 'vardas': case 'pavarde':
        return /^\p{L}+$/u.test(value) ? '' : 'Įveskite tik raides.';
      case 'pastas':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !field.validity.typeMismatch ? '' : 'Įveskite tinkamą el. pašto adresą.';
      case 'telefonas':
        return /^\+370 6\d{2} \d{5}$/.test(value) ? '' : 'Numeris turi būti +370 6xx xxxxx formato.';
      case 'q1': case 'q2': case 'q3':
        return Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 10 ? '' : 'Įveskite sveiką skaičių nuo 1 iki 10.';
      default: return '';
    }
  }
  function validate() {
    let valid = true;
    fields.forEach(field => {
      const message = errorFor(field);
      if (message) valid = false;
      const visible = touched.has(field) && Boolean(message);
      field.setAttribute('aria-invalid', String(visible));
      document.getElementById(field.id + '-error').textContent = visible ? message : '';
    });
    send.disabled = !valid;
    return valid;
  }
  fields.forEach(field => {
    field.addEventListener('input', () => {
      if (field === phone) formatPhone();
      touched.add(field);
      validate();
    });
    field.addEventListener('blur', () => { touched.add(field); validate(); });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    fields.forEach(field => touched.add(field));
    if (!validate()) return;
    // Visos reikšmės viename JavaScript objekte.
    const data = Object.fromEntries(fields.map(field => [field.name,
      field.type === 'number' ? Number(field.value) : field.value.trim()]));
    console.log(data);
    values.replaceChildren();
    const labels = { vardas: 'Vardas', pavarde: 'Pavardė', pastas: 'El. paštas', telefonas: 'Tel. numeris', adresas: 'Adresas', q1: 'Svetainės dizainas', q2: 'Turinio aiškumas', q3: 'Svetainės patogumas' };
    Object.entries(data).forEach(([key, value]) => {
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = labels[key] + ':';
      description.textContent = value;
      values.append(term, description);
    });
    const mean = (data.q1 + data.q2 + data.q3) / 3;
    average.textContent = `${data.vardas} ${data.pavarde}: ${mean.toFixed(2).replace('.', ',')}`;
    result.hidden = false;
  });
  clear.addEventListener('click', () => {
    form.reset();
    touched.clear();
    values.replaceChildren();
    average.textContent = '';
    result.hidden = true;
    validate();
  });
  validate();
})();
