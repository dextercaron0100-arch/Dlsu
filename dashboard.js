const menuButton = document.querySelector('#menuButton');
const sidebar = document.querySelector('#sidebar');
const scrim = document.querySelector('#scrim');
const studentMenu = document.querySelector('#studentMenu');
const profilePopover = document.querySelector('#profilePopover');

const closeSidebar = () => {
  sidebar.classList.remove('open');
  scrim.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
};

menuButton.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  scrim.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
scrim.addEventListener('click', closeSidebar);

studentMenu.addEventListener('click', () => {
  const isOpen = profilePopover.classList.toggle('open');
  studentMenu.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('#sideNav a').forEach((link) => link.addEventListener('click', () => {
  document.querySelectorAll('#sideNav a').forEach((item) => item.classList.remove('active'));
  link.classList.add('active');
  closeSidebar();
}));

document.querySelector('#menuSearch').addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('#sideNav a').forEach((link) => {
    link.hidden = !link.textContent.toLowerCase().includes(query);
  });
});

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
  tab.classList.add('active');
  const overdue = tab.dataset.tab === 'overdue';
  const paymentContent = document.querySelector('#paymentContent');
  if (paymentContent) paymentContent.innerHTML = `<strong>No Payments Found…</strong><p>You have no ${overdue ? 'overdue' : 'upcoming'} payments at this time.</p>`;
}));

const hour = new Date().getHours();
const greeting = document.querySelector('#greeting');
if (greeting) greeting.textContent = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

document.querySelectorAll('.payment-view-tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.payment-view-tab').forEach((item) => item.classList.remove('active'));
  tab.classList.add('active');
  const isHistory = tab.dataset.view === 'history';
  const emptyRow = document.querySelector('#paymentTableBody');
  if (emptyRow) emptyRow.innerHTML = `<tr><td colspan="4">${isHistory ? 'No payment history found.' : 'No current payments found.'}</td></tr>`;
}));
