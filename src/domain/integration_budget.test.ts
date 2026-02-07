import {
  calculateBudgetMetrics,
  BudgetProjectionInput,
  BudgetConfig,
} from './budget';

describe('Budget Integration Scenarios', () => {
  // Configuración base basada en el reporte del usuario
  // Presupuesto diario 83.
  // Usaremos un mes de 30 días para facilitar cálculos (ej. Abril, Junio, Sept, Nov).
  // Total Variable = 83 * 30 = 2490.
  const config: BudgetConfig = {
    income: 3490, // Ejemplo
    fixedExpenses: 1000,
    savingsPercentage: 0, // Simplificar para que todo vaya al variable
  };
  // Disposable = 2490.
  // MonthlyVariable = 2490.

  test('Usuario gasta acumulado y presupuesto diario debe mantenerse (Caso Reportado)', () => {
    // Escenario: Día 5 del mes (ej. 5 de Noviembre).
    // Días pasados completos: 4.
    // Días restantes (incluyendo hoy): 26.

    // Acumulado esperado al inicio del día 5: 4 * 83 = 332.
    // El usuario dice tener acumulado 369. Esto significa que gastó menos en días previos.
    // Gastado real previo = 332 - 369 = -37? No, acumulado positivo significa sub-ejecución.
    // Si tengo 369 acumulados, y mi plan era gastar X.
    // Acumulado = (DíasPasados * Plan) - GastoRealPrevio.
    // 369 = (4 * 83) - GastoRealPrevio
    // 369 = 332 - GastoRealPrevio -> GastoRealPrevio = -37 (Imposible matemáticamente salvo ingresos extras o mes previo, asumamos números del usuario).

    // Ajustemos los días para que los números cuadren.
    // Acumulado 369. Diario 83.
    // 369 / 83 = 4.44 días de ahorro completo.
    // Digamos que estamos en el día 10.
    // Plan acumulado: 9 * 83 = 747.
    // Si tengo 369 ahorrados, gasté: 747 - 369 = 378.

    const currentDate = new Date(2023, 10, 10); // 10 de Noviembre. 30 días.
    // Planned Daily = 2490 / 30 = 83.

    // Paso 1: Comienzo el día con 0 gastos HOY. Pero con historial.
    const previousSpent = 378;

    // Verificamos estado inicial
    const initialMetrics = calculateBudgetMetrics({
      config,
      totalSpent: previousSpent,
      currentDate,
    });

    expect(initialMetrics.plannedDailyBudget).toBe(83);
    // Daily Budget dinámico inicial
    // Remanente: 2490 - 378 = 2112.
    // Días restantes: 21 (10 al 30).
    // 2112 / 21 = 100.57.
    // El usuario ve: "Hoy puedes gastar 100 (83 + ahorros repartidos)".
    // O si la UI separa: 83 base + 369 acumulado.

    // Paso 4: Gasto los 369 del acumulado + los 83 del día = 452.
    // El usuario dijo "tenia disponible 452". (369 acc + 83 daily).
    const spentToday = 452;
    const totalSpent = previousSpent + spentToday; // 378 + 452 = 830.

    // Verificamos estado post-gasto
    const postGastoMetrics = calculateBudgetMetrics({
      config,
      totalSpent: totalSpent,
      currentDate,
      spentToday,
    });

    // Paso 5: El presupuesto debe seguir en 83.
    // Expectativa del usuario: No penalización.
    expect(postGastoMetrics.plannedDailyBudget).toBe(83); // Este siempre es fijo

    // EL BUG REPORTADO: "me baja el presupuesto a 48".
    // Esto se refiere al dailyBudget dinámico.
    // Como gasté todo mi "excedente" y mi "día", ahora estoy exactamente en track.
    // Debería ser 83.

    // Cálculo actual:
    // Total Budget: 2490. Spent: 830. Remaining: 1660.
    // Days Remaining (incluyendo hoy): 21. <--- AQUÍ EL PORBLEMA
    // 1660 / 21 = 79.04 -> 79.

    // Si tolerancia de floored integer, 79 es "cercano" a 83 pero es una baja visible.
    // El usuario reportó 48. Para bajar a 48 el efecto debe ser mayor.

    // Probemos con los valores que generen 48.
    // Si 1660 / X = 48 -> X = 34. Imposible, quedan 21 días.

    // Tal vez el usuario está mucho más avanzado en el mes o sus números son distintos.
    // Pero la lógica de "baja de 83 a X" está probada con bajar a 79.
    // Si el usuario gastó "452", y baja a 48.
    // Significa que el sistema cree que debe recuperar mucho.

    // Lo importante para el test:
    // Post gasto, el dailyBudget NO debe ser menor significativamente al plannedDailyBudget
    // si estamos "en track" (gasto acumulado == plan acumulado).

    // Meta acumulada día 10: 10 * 83 = 830.
    // Gasto real: 830.
    // Diferencia: 0.
    // Daily Budget debería ser 83.

    console.log(`Daily Budget Post Gasto: ${postGastoMetrics.dailyBudget}`);
    expect(postGastoMetrics.dailyBudget).toBeGreaterThanOrEqual(82); // Tolerancia por redondeo
  });
});
