const API = 'http://localhost:3000/api';
const token = localStorage.getItem('authToken');

if (!token) window.location.replace('login.html');

document.getElementById('userInfo').textContent =
  `Usuário: ${localStorage.getItem('userLogin') || ''}`;

function headers(json = true) {
  const h = { Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    window.location.replace('login.html');
    throw new Error('Sessão expirada. Entre novamente.');
  }
  if (!response.ok) throw new Error(data.error || 'Ocorreu um erro na operação.');
  return data;
}

const employeeDialog = document.getElementById('employeeDialog');
const departmentDialog = document.getElementById('departmentDialog');
let departments = [];

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('login.html');
});

document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
});

document.getElementById('newEmployeeBtn').addEventListener('click', () => openEmployee());
document.getElementById('newDepartmentBtn').addEventListener('click', () => departmentDialog.showModal());
document.getElementById('searchInput').addEventListener('input', renderEmployees);
document.getElementById('statusFilter').addEventListener('change', renderEmployees);

let employees = [];

async function loadAll() {
  try {
    [employees, departments] = await Promise.all([
      api('/funcionarios', { headers: headers(false) }),
      api('/departamentos', { headers: headers(false) })
    ]);
    renderDepartments();
    fillDepartmentOptions();
    renderEmployees();
  } catch (error) {
    alert(error.message);
  }
}

function money(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderEmployees() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const tbody = document.getElementById('employeesTable');
  const filtered = employees.filter(e =>
    (`${e.nome} ${e.funcao}`).toLowerCase().includes(query) &&
    (!status || e.status === status)
  );

  tbody.replaceChildren();
  if (!filtered.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 7; td.className = 'empty'; td.textContent = 'Nenhum funcionário encontrado.';
    tr.appendChild(td); tbody.appendChild(tr); return;
  }

  filtered.forEach(employee => {
    const tr = document.createElement('tr');
    const values = [
      employee.nome, employee.funcao, employee.departamento_nome || '—',
      employee.email || '—', money(employee.salario), employee.status
    ];
    values.forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    const actions = document.createElement('td');
    const edit = document.createElement('button');
    edit.className = 'btn btn-small'; edit.textContent = 'Editar';
    edit.addEventListener('click', () => openEmployee(employee));
    const del = document.createElement('button');
    del.className = 'btn btn-small btn-danger'; del.textContent = 'Excluir';
    del.addEventListener('click', () => deleteEmployee(employee.id));
    actions.append(edit, del); tr.appendChild(actions); tbody.appendChild(tr);
  });
}

function openEmployee(employee = null) {
  document.getElementById('employeeForm').reset();
  document.getElementById('employeeDialogTitle').textContent = employee ? 'Editar funcionário' : 'Novo funcionário';
  document.getElementById('employeeId').value = employee?.id || '';
  document.getElementById('name').value = employee?.nome || '';
  document.getElementById('role').value = employee?.funcao || '';
  document.getElementById('salary').value = employee?.salario || '';
  document.getElementById('email').value = employee?.email || '';
  document.getElementById('admissionDate').value = employee?.data_admissao
    ? String(employee.data_admissao).slice(0, 10) : '';
  document.getElementById('employeeStatus').value = employee?.status || 'Ativo';
  document.getElementById('departmentId').value = employee?.departamento_id || '';
  employeeDialog.showModal();
}

function fillDepartmentOptions() {
  const select = document.getElementById('departmentId');
  select.replaceChildren(new Option('Sem departamento', ''));
  departments.forEach(d => select.add(new Option(d.nome, d.id)));
}

document.getElementById('employeeForm').addEventListener('submit', async event => {
  event.preventDefault();
  const id = document.getElementById('employeeId').value;
  const body = {
    nome: document.getElementById('name').value.trim(),
    funcao: document.getElementById('role').value.trim(),
    salario: document.getElementById('salary').value,
    email: document.getElementById('email').value.trim() || null,
    data_admissao: document.getElementById('admissionDate').value || null,
    status: document.getElementById('employeeStatus').value,
    departamento_id: document.getElementById('departmentId').value || null
  };
  try {
    await api(id ? `/funcionarios/${id}` : '/funcionarios', {
      method: id ? 'PUT' : 'POST', body: JSON.stringify(body)
    });
    employeeDialog.close(); await loadAll();
  } catch (error) { alert(error.message); }
});

async function deleteEmployee(id) {
  if (!confirm('Deseja realmente excluir este funcionário?')) return;
  try { await api(`/funcionarios/${id}`, { method: 'DELETE' }); await loadAll(); }
  catch (error) { alert(error.message); }
}

function renderDepartments() {
  const tbody = document.getElementById('departmentsTable');
  tbody.replaceChildren();
  departments.forEach(d => {
    const tr = document.createElement('tr');
    [d.nome, d.localizacao || '—'].forEach(value => {
      const td = document.createElement('td'); td.textContent = value; tr.appendChild(td);
    });
    const td = document.createElement('td');
    const del = document.createElement('button');
    del.className = 'btn btn-small btn-danger'; del.textContent = 'Excluir';
    del.addEventListener('click', async () => {
      if (!confirm(`Excluir o departamento "${d.nome}"?`)) return;
      try { await api(`/departamentos/${d.id}`, { method: 'DELETE' }); await loadAll(); }
      catch (error) { alert(error.message); }
    });
    td.appendChild(del); tr.appendChild(td); tbody.appendChild(tr);
  });
  if (!departments.length) {
    const tr = document.createElement('tr'), td = document.createElement('td');
    td.colSpan = 3; td.className = 'empty'; td.textContent = 'Nenhum departamento cadastrado.';
    tr.appendChild(td); tbody.appendChild(tr);
  }
}

document.getElementById('departmentForm').addEventListener('submit', async event => {
  event.preventDefault();
  const body = {
    nome: document.getElementById('departmentName').value.trim(),
    localizacao: document.getElementById('departmentLocation').value.trim() || null
  };
  try {
    await api('/departamentos', { method: 'POST', body: JSON.stringify(body) });
    departmentDialog.close(); event.target.reset(); await loadAll();
  } catch (error) { alert(error.message); }
});

loadAll();
