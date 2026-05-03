import { funeralBudgetData } from "./funeral";
import { weddingBudgetData } from "./wedding";
import { umGidiBudgetData } from "./umgidi";
import { umemuloBudgetData } from "./umemulo";
import { birthdayAdultBudgetData } from "./birthday-adult";
import { birthdayKidsBudgetData } from "./birthday-kids";
import { birthdayTeenBudgetData } from "./birthday-teen";
import { birthdaySeniorBudgetData } from "./birthday-senior";
import { otherBudgetData } from "./other";

export const budgetTemplates = {
  funeral: funeralBudgetData,
  wedding: weddingBudgetData,
  umgidi: umGidiBudgetData,
  umemulo: umemuloBudgetData,
  birthday_adult: birthdayAdultBudgetData,
  birthday_kids: birthdayKidsBudgetData,
  birthday_teen: birthdayTeenBudgetData,
  birthday_senior: birthdaySeniorBudgetData,
  // explicit alias: birthday routes to birthday_adult when no age group is specified
  birthday: birthdayAdultBudgetData,
  other: otherBudgetData,
};
