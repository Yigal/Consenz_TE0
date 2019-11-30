import { DirectiveOptions } from 'vue';
import * as enums from '@/types/enums';

export const colorDirective: DirectiveOptions = {
  inserted(el, node) {
    if ('color' in node.value) {
      el.style.color = getColor()[node.value.color];
    } else if ('backgroundColor' in node.value) {
      el.style.backgroundColor = getColor()[node.value.backgroundColor];
    }
  },
};

const getColor = () =>
  Object.assign(
    {},
    {
      [enums.FEED_TYPE.sectionApproved]: '#0fc3ac',
      [enums.FEED_TYPE.sectionEdited]: '#0fc3ac',
      [enums.SECTION_STATUS.approved]: '#0fc3ac',
      [enums.FEED_TYPE.edited]: '#0fc3ac',
      pros: '#0fc3ac',
      true: '#0fc3ac',
      [enums.SECTION_STATUS.inTheVote]: '#69378e',
      undefined: '#000000de',
      comment: '#69378e',
      add: '#69378e',
      addComment: '#69378e',
      [enums.SECTION_STATUS.toEdit]: '#ecd138',
      [enums.FEED_TYPE.deleted]: '#ecd138',
      cons: '#ff5252',
      false: '#ff5252',
      [enums.FEED_TYPE.rejected]: '#ff5252',
      [enums.SECTION_STATUS.toDelete]: '#ff5252',
    },
  );
