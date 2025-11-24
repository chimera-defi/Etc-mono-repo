import { StatefulComponent } from 'valdi_core/src/Component';
import { Label, View } from 'valdi_tsx/src/NativeTemplateElements';
import { Style } from 'valdi_core/src/Style';
import { systemBoldFont, systemFont } from 'valdi_core/src/SystemFont';

/**
 * @ViewModel
 * @ExportModel
 */
export interface AppViewModel {}

/**
 * @Context
 * @ExportModel
 */
export interface AppComponentContext {}

interface State {}

/**
 * @Component
 * @ExportModel
 */
export class App extends StatefulComponent<AppViewModel, AppComponentContext> {
  state: State = {};

  onCreate(): void {
    console.log('Hello World App created!');
  }

  onDestroy(): void {
    console.log('Hello World App destroyed!');
  }

  onRender(): void {
    <view style={styles.container}>
      <view style={styles.card}>
        <label style={styles.title} value="Hello, Valdi! 👻" />
        <label style={styles.subtitle} value="Welcome to your first Valdi app" />
        <label style={styles.description} value="This is a simple Hello World app built with Valdi from Snapchat" />
      </view>
    </view>;
  }
}

const styles = {
  container: new Style<View>({
    backgroundColor: '#FFFC00',
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 80,
    paddingBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  card: new Style<View>({
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0 8 24 rgba(0, 0, 0, 0.15)',
  }),
  title: new Style<Label>({
    color: '#050505',
    font: systemBoldFont(32),
    marginBottom: 16,
  }),
  subtitle: new Style<Label>({
    color: '#333333',
    font: systemFont(18),
    marginBottom: 24,
  }),
  description: new Style<Label>({
    color: '#666666',
    font: systemFont(14),
    textAlign: 'center',
  }),
};
