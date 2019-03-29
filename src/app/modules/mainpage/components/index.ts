
import { TestPageComponent } from './test-page/test-page.component';
import { TestHeaderComponent } from './test-header/test-header.component';

import { TestContainerComponent } from './test-container.component';

export { TestPageComponent, TestHeaderComponent, TestContainerComponent };

// export declare const DEMO_APP_COMPONENTS:(typeof TestPageComponent | typeof DemoContainerComponent | typeof DemoNavComponent | typeof DemoPageComponent | typeof DemoEditComponent )
export let TEST_APP_COMPONENTS =
[ TestPageComponent, TestHeaderComponent, TestContainerComponent ];
