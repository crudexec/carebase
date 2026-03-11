/**
 * OASIS Skip Logic Engine
 * Evaluates skip logic rules and determines item visibility
 */

import type {
  SkipLogicRule,
  SkipCondition,
  SkipLogicResult,
  OasisTimePoint,
  OasisResponseValue,
  OasisItemData,
} from './types';

/**
 * Evaluates a single condition against a response value
 */
export function evaluateCondition(
  condition: SkipCondition,
  responses: Map<string, OasisResponseValue>
): boolean {
  const response = responses.get(condition.itemCode);

  // Get the actual value from the response
  const actualValue = getResponseValue(response);

  switch (condition.operator) {
    case 'equals':
      return actualValue === condition.value;

    case 'not_equals':
      return actualValue !== condition.value;

    case 'in':
      if (Array.isArray(condition.value)) {
        return condition.value.includes(actualValue as string | number);
      }
      return false;

    case 'not_in':
      if (Array.isArray(condition.value)) {
        return !condition.value.includes(actualValue as string | number);
      }
      return true;

    case 'greater_than':
      if (typeof actualValue === 'number' && typeof condition.value === 'number') {
        return actualValue > condition.value;
      }
      return false;

    case 'less_than':
      if (typeof actualValue === 'number' && typeof condition.value === 'number') {
        return actualValue < condition.value;
      }
      return false;

    case 'greater_than_or_equals':
      if (typeof actualValue === 'number' && typeof condition.value === 'number') {
        return actualValue >= condition.value;
      }
      return false;

    case 'less_than_or_equals':
      if (typeof actualValue === 'number' && typeof condition.value === 'number') {
        return actualValue <= condition.value;
      }
      return false;

    case 'range':
      if (typeof actualValue === 'number' && condition.range) {
        const [min, max] = condition.range;
        return actualValue >= min && actualValue <= max;
      }
      return false;

    case 'is_null':
      return actualValue === null || actualValue === undefined;

    case 'is_not_null':
      return actualValue !== null && actualValue !== undefined;

    case 'contains':
      if (typeof actualValue === 'string' && typeof condition.value === 'string') {
        return actualValue.includes(condition.value);
      }
      if (Array.isArray(actualValue) && condition.value !== undefined) {
        return actualValue.includes(condition.value);
      }
      return false;

    case 'not_contains':
      if (typeof actualValue === 'string' && typeof condition.value === 'string') {
        return !actualValue.includes(condition.value);
      }
      if (Array.isArray(actualValue) && condition.value !== undefined) {
        return !actualValue.includes(condition.value);
      }
      return true;

    default:
      return false;
  }
}

/**
 * Extracts the actual value from an OasisResponseValue
 */
function getResponseValue(response: OasisResponseValue | undefined): string | number | boolean | null | unknown[] {
  if (!response) return null;

  // Check each value type in order of preference
  if (response.text !== undefined) return response.text;
  if (response.number !== undefined) return response.number;
  if (response.boolean !== undefined) return response.boolean;
  if (response.date !== undefined) return response.date?.toString() || null;
  if (response.json !== undefined) {
    // For JSON values, try to extract a simple value if possible
    if (Array.isArray(response.json)) return response.json;
    if (typeof response.json === 'object' && response.json !== null) {
      // Check for common value properties
      const obj = response.json as Record<string, unknown>;
      if ('value' in obj) return obj.value as string | number | boolean;
      if ('code' in obj) return obj.code as string;
    }
    return null;
  }

  return null;
}

/**
 * Evaluates a skip logic rule
 */
export function evaluateRule(
  rule: SkipLogicRule,
  responses: Map<string, OasisResponseValue>,
  currentTimePoint: OasisTimePoint
): boolean {
  // Check if rule applies to current time point
  if (rule.timePoints && rule.timePoints.length > 0) {
    if (!rule.timePoints.includes(currentTimePoint)) {
      return false;
    }
  }

  // Evaluate conditions
  const results = rule.conditions.map(condition =>
    evaluateCondition(condition, responses)
  );

  // Combine results based on operator
  if (rule.conditionOperator === 'AND') {
    return results.every(r => r);
  } else {
    return results.some(r => r);
  }
}

/**
 * Evaluates all skip logic rules for an item set
 */
export function evaluateSkipLogic(
  items: OasisItemData[],
  responses: Map<string, OasisResponseValue>,
  currentTimePoint: OasisTimePoint
): SkipLogicResult {
  const result: SkipLogicResult = {
    hiddenItems: new Set(),
    skippedItems: new Set(),
    disabledItems: new Set(),
  };

  // Build a map of item codes for quick lookup
  const itemCodeSet = new Set(items.map(item => item.code));

  // Process each item's skip logic
  for (const item of items) {
    if (!item.skipLogic || item.skipLogic.length === 0) continue;

    for (const unknownRule of item.skipLogic) {
      const rule = unknownRule as SkipLogicRule;
      const triggered = evaluateRule(rule, responses, currentTimePoint);

      if (triggered) {
        switch (rule.action) {
          case 'skip_to':
            // Mark all items between current and target as skipped
            if (rule.target) {
              result.skipToItem = rule.target;
              const currentIndex = items.findIndex(i => i.code === item.code);
              const targetIndex = items.findIndex(i => i.code === rule.target);

              if (currentIndex !== -1 && targetIndex !== -1 && targetIndex > currentIndex) {
                for (let i = currentIndex + 1; i < targetIndex; i++) {
                  result.skippedItems.add(items[i].code);
                  result.hiddenItems.add(items[i].code);
                }
              }
            }
            break;

          case 'hide':
            if (rule.target && itemCodeSet.has(rule.target)) {
              result.hiddenItems.add(rule.target);
            }
            break;

          case 'show':
            // Remove from hidden if it was hidden
            if (rule.target) {
              result.hiddenItems.delete(rule.target);
            }
            break;

          case 'disable':
            if (rule.target && itemCodeSet.has(rule.target)) {
              result.disabledItems.add(rule.target);
            }
            break;

          case 'enable':
            // Remove from disabled if it was disabled
            if (rule.target) {
              result.disabledItems.delete(rule.target);
            }
            break;
        }
      }
    }
  }

  return result;
}

/**
 * Gets the next navigable item code, respecting skip logic
 */
export function getNextItem(
  currentItemCode: string,
  items: OasisItemData[],
  responses: Map<string, OasisResponseValue>,
  currentTimePoint: OasisTimePoint
): string | null {
  const skipResult = evaluateSkipLogic(items, responses, currentTimePoint);

  // If there's a skip-to target, use that
  if (skipResult.skipToItem) {
    return skipResult.skipToItem;
  }

  // Find current index
  const currentIndex = items.findIndex(item => item.code === currentItemCode);
  if (currentIndex === -1) return null;

  // Find next visible item
  for (let i = currentIndex + 1; i < items.length; i++) {
    const item = items[i];

    // Skip hidden items
    if (skipResult.hiddenItems.has(item.code)) continue;

    // Skip items not visible at current time point
    if (!item.visibleAt.includes(currentTimePoint)) continue;

    return item.code;
  }

  return null;
}

/**
 * Gets the previous navigable item code, respecting skip logic
 */
export function getPreviousItem(
  currentItemCode: string,
  items: OasisItemData[],
  responses: Map<string, OasisResponseValue>,
  currentTimePoint: OasisTimePoint
): string | null {
  const skipResult = evaluateSkipLogic(items, responses, currentTimePoint);

  // Find current index
  const currentIndex = items.findIndex(item => item.code === currentItemCode);
  if (currentIndex === -1) return null;

  // Find previous visible item
  for (let i = currentIndex - 1; i >= 0; i--) {
    const item = items[i];

    // Skip hidden items
    if (skipResult.hiddenItems.has(item.code)) continue;

    // Skip items not visible at current time point
    if (!item.visibleAt.includes(currentTimePoint)) continue;

    return item.code;
  }

  return null;
}

/**
 * Gets all visible items for a given time point
 */
export function getVisibleItems(
  items: OasisItemData[],
  responses: Map<string, OasisResponseValue>,
  currentTimePoint: OasisTimePoint
): OasisItemData[] {
  const skipResult = evaluateSkipLogic(items, responses, currentTimePoint);

  return items.filter(item => {
    // Must be visible at current time point
    if (!item.visibleAt.includes(currentTimePoint)) return false;

    // Must not be hidden by skip logic
    if (skipResult.hiddenItems.has(item.code)) return false;

    return true;
  });
}

/**
 * Validates that skipped items don't have responses
 */
export function validateSkippedItems(
  items: OasisItemData[],
  responses: Map<string, OasisResponseValue>,
  currentTimePoint: OasisTimePoint
): { valid: boolean; errors: string[] } {
  const skipResult = evaluateSkipLogic(items, responses, currentTimePoint);
  const errors: string[] = [];

  for (const skippedCode of skipResult.skippedItems) {
    const response = responses.get(skippedCode);
    if (response && getResponseValue(response) !== null) {
      errors.push(`Item ${skippedCode} was skipped but has a response value`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Clears responses for skipped items
 */
export function clearSkippedResponses(
  items: OasisItemData[],
  responses: Map<string, OasisResponseValue>,
  currentTimePoint: OasisTimePoint
): Map<string, OasisResponseValue> {
  const skipResult = evaluateSkipLogic(items, responses, currentTimePoint);
  const cleanedResponses = new Map(responses);

  for (const skippedCode of skipResult.skippedItems) {
    cleanedResponses.delete(skippedCode);
  }

  return cleanedResponses;
}

/**
 * Creates a skip logic rule from OASIS text notation
 * e.g., "→ Skip to M1322" or "If 0 → Skip to B0200"
 */
export function parseSkipInstruction(
  itemCode: string,
  instruction: string
): SkipLogicRule | null {
  // Pattern: "→ Skip to [CODE]" or "If [VALUE] → Skip to [CODE]"
  const simpleSkipMatch = instruction.match(/→\s*Skip to\s+([A-Z0-9]+)/i);
  const conditionalSkipMatch = instruction.match(/If\s+(\d+|NA|UK)\s*→\s*Skip to\s+([A-Z0-9]+)/i);

  if (conditionalSkipMatch) {
    const [, value, target] = conditionalSkipMatch;
    return {
      id: `${itemCode}_skip_${value}`,
      conditions: [{
        itemCode,
        operator: 'equals',
        value: isNaN(Number(value)) ? value : Number(value),
      }],
      conditionOperator: 'AND',
      action: 'skip_to',
      target,
      description: instruction,
    };
  }

  if (simpleSkipMatch) {
    const [, target] = simpleSkipMatch;
    return {
      id: `${itemCode}_skip`,
      conditions: [{
        itemCode,
        operator: 'is_not_null',
      }],
      conditionOperator: 'AND',
      action: 'skip_to',
      target,
      description: instruction,
    };
  }

  return null;
}
