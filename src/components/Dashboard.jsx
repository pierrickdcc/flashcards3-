import React, { useMemo } from 'react';
import { useFlashcard } from '../context/FlashcardContext';
import styles from './Dashboard.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const Dashboard = () => {
  const { cards, subjects } = useFlashcard();

  const stats = useMemo(() => {
    if (!cards || cards.length === 0) {
      return null;
    }

    // 1. Review Forecast for the next 7 days
    const forecast = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const count = cards.filter(c => new Date(c.nextReview).toDateString() === date.toDateString()).length;
      return { day, a_reviser: count };
    });

    const toReviewToday = forecast[0].a_reviser;

    // 2. Strength by Subject (average interval)
    const strengthBySubject = (subjects || []).map(subject => {
      const subjectCards = cards.filter(c => c.subject === subject.name);
      if (subjectCards.length === 0) {
        return { name: subject.name, force: 0 };
      }
      const avgInterval = subjectCards.reduce((acc, c) => acc + (c.interval || 1), 0) / subjectCards.length;
      return { name: subject.name, force: Math.round(avgInterval * 10) / 10 };
    }).sort((a, b) => b.force - a.force);

    // 3. Card Distribution
    const cardDistribution = (subjects || []).map(subject => ({
      name: subject.name,
      value: cards.filter(c => c.subject === subject.name).length
    })).filter(s => s.value > 0);

    // 4. Difficult Cards
    const difficultCards = [...cards]
      .sort((a, b) => {
        const scoreA = (a.reviewCount || 0) / (a.interval || 1);
        const scoreB = (b.reviewCount || 0) / (b.interval || 1);
        return scoreB - scoreA;
      })
      .slice(0, 5);

    const totalInterval = cards.reduce((acc, c) => acc + (c.interval || 1), 0);
    const averageStrength = cards.length > 0 ? Math.round((totalInterval / cards.length) * 10) / 10 : 0;


    return { forecast, toReviewToday, strengthBySubject, cardDistribution, difficultCards, averageStrength };
  }, [cards, subjects]);

  if (!stats) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.emptyState}>
          <h2>Commencez à ajouter des cartes !</h2>
          <p>Le tableau de bord affichera vos statistiques une fois que vous aurez du contenu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
       <div className={styles.grid}>
        <div className={styles.statCard}>
          <h3>Total des cartes</h3>
          <p>{cards.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>À réviser</h3>
          <p>{stats.toReviewToday}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Matières</h3>
          <p>{subjects?.length || 0}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.chartContainer}>
          <h3>Prévisions de révision (7 prochains jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="a_reviser" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartContainer}>
          <h3>Force par matière (intervalle moyen en jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.strengthBySubject} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="force" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartContainer}>
          <h3>Répartition des cartes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.cardDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {stats.cardDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartContainer}>
          <h3>Cartes difficiles (Top 5)</h3>
          <ul className={styles.difficultCardsList}>
            {stats.difficultCards.map(card => (
              <li key={card.id}>
                <span className={styles.question}>{card.question}</span>
                <span className={styles.subject}>{card.subject}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
