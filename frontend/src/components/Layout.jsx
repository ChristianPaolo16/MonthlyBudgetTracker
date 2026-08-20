import Sidebar from './Sidebar';

const pageTitles = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/income': 'Income',
  '/accounts': 'Accounts',
  '/expense-categories': 'Expense Categories',
  '/income-categories': 'Income Categories',
  '/investments': 'Investments',
  '/budget-goals': 'Budget Goals',
};

export default function Layout({ children }) {
  const path = window.location.pathname;
  const title = pageTitles[path] || 'Dashboard';

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <header className="layout__topbar">
          <h1 className="layout__title">{title}</h1>
          <div className="layout__topbar-right">
            <span className="layout__date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
}
