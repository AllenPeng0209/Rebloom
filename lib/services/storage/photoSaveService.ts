import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { t } from './i18n';

export class PhotoSaveService {
  static async savePhotoToLibrary(imageUrl: string): Promise<boolean> {
    try {
      // 請求媒體庫權限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error') || 'Error',
          t('photo.permissionPhotoLibraryRequired') || t('home.permissionRequired', { permission: t('home.photoLibrary') })
        );
        return false;
      }

      // 下載照片
      const filename = imageUrl.split('/').pop() || `photo_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status === 200) {
        // 保存到相簿
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        
        // 創建相簿（如果不存在）
        const albumName = 'KonKon 事件照片';
        let album;
        try {
          album = await MediaLibrary.getAlbumAsync(albumName);
        } catch (error) {
          // 相簿不存在，創建新的
          album = null;
        }
        
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        }

        Alert.alert(t('common.success') || 'Success', t('photo.saveSuccessMessage'));
        
        // 清理臨時文件
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        return true;
      } else {
        throw new Error('download_failed');
      }
    } catch (error: any) {
      console.error('保存照片失敗:', error);
      Alert.alert(t('common.error') || 'Error', t('photo.saveFailedMessage'));
      return false;
    }
  }
} 