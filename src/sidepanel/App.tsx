import { ConfigProvider } from 'antd'
import { genesisTheme } from './styles/token'
import { BookmarkProvider } from './context/BookmarkContext'
import AddressBar from './components/AddressBar'
import ContentArea from './components/ContentArea'
import StatusBar from './components/StatusBar'

export default function App() {
  return (
    <ConfigProvider theme={genesisTheme}>
      <BookmarkProvider>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <AddressBar />
          <ContentArea />
          <StatusBar />
        </div>
      </BookmarkProvider>
    </ConfigProvider>
  )
}
