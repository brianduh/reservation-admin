import { Component, type ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px' }}>
          <Result
            status="error"
            title="發生錯誤"
            subTitle={`錯誤訊息: ${this.state.error?.message || '未知錯誤'}`}
            extra={[
              <Button type="primary" key="reload" onClick={() => window.location.reload()}>
                重新載入
              </Button>,
            ]}
          />
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>錯誤詳情</summary>
            <pre style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
