// This file contains all the types for Assessment (Quiz)

/**
 * The type of an assessment item.
 */
export type AssessmentItemType = 'MultipleChoice' | 'Identification'

/**
 * An item of an assessment.
 * @difficulty For the weight of each item.
 * @no The number of an item.
 * @question The question of the item.
 * @content The content of the item (MultipleChoice | Identification).
 */
export interface AssessmentItem {
  difficulty: number, // Difficulty for the weight of each item
  no: number,
  question: string,
  content: Identification | MultipleChoice
}

/**
 * An identification type of assessment item.
 * @type Use this to check the type of the content of an Assessment item.
 * @answers List of correct answers.
 */
export interface Identification {
  type: 'Identification',
  answers: string[] // Array of strings to contain multiple possible answers
}

/**
 * A single choice for a multiple choice type of assessment item.
 * @content To display the choice.
 * @correct Field to check if the choice is correct.
 */
export interface Choice {
  content: string,
  correct: boolean,
}

/**
 * A multiple choice type of assessment item.
 * @type Use this to check the type of the content of an Assessment item.
 * @choices List of choices.
 */
export interface MultipleChoice {
  type: 'MultipleChoice',
  choices: Choice[],
}