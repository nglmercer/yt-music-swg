export interface Root {
  playlistPanelVideoRenderer: PlaylistPanelVideoRenderer;
}

export interface PlaylistPanelVideoRenderer {
  title: Title;
  longBylineText: LongBylineText;
  thumbnail: Thumbnail;
  lengthText: LengthText;
  selected: boolean;
  navigationEndpoint: PlaylistPanelVideoRendererNavigationEndpoint;
  videoId: string;
  shortBylineText: LongBylineText;
  trackingParams: string;
  menu: Menu;
  playlistSetVideoId: string;
  canReorder: boolean;
  playlistEditParams: string;
  queueNavigationEndpoint: QueueNavigationEndpoint;
}

export interface LengthText {
  runs: Run[];
  accessibility: Accessibility;
}

export interface Accessibility {
  accessibilityData: AccessibilityData;
}

export interface AccessibilityData {
  label: string;
}

export interface Run {
  text: string;
  navigationEndpoint?: RunNavigationEndpoint;
}

export interface RunNavigationEndpoint {
  clickTrackingParams: string;
  browseEndpoint?: BrowseEndpoint;
  watchEndpoint?: WatchEndpoint;
}

export interface BrowseEndpoint {
  browseId: string;
  browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs;
}

export interface BrowseEndpointContextSupportedConfigs {
  browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig;
}

export interface BrowseEndpointContextMusicConfig {
  pageType: string;
}

export interface WatchEndpoint {
  videoId: string;
  playlistId: string;
  index?: number;
  params: string;
  playerParams?: string;
  playlistSetVideoId?: string;
  loggingContext?: LoggingContext;
  watchEndpointMusicSupportedConfigs?: WatchEndpointMusicSupportedConfigs;
}

export interface LoggingContext {
  vssLoggingContext: VssLoggingContext;
}

export interface VssLoggingContext {
  serializedContextData: string;
}

export interface WatchEndpointMusicSupportedConfigs {
  watchEndpointMusicConfig: WatchEndpointMusicConfig;
}

export interface WatchEndpointMusicConfig {
  hasPersistentPlaylistPanel?: boolean;
  musicVideoType: string;
}

export interface LongBylineText {
  runs: Run[];
}

export interface Menu {
  menuRenderer: MenuRenderer;
}

export interface MenuRenderer {
  items: Item[];
  trackingParams: string;
  accessibility: Accessibility;
}

export interface Item {
  menuNavigationItemRenderer?: MenuNavigationItemRenderer;
  menuServiceItemRenderer?: MenuServiceItemRenderer;
  toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer;
}

export interface MenuNavigationItemRenderer {
  text: LongBylineText;
  icon: Icon;
  navigationEndpoint: MenuNavigationItemRendererNavigationEndpoint;
  trackingParams: string;
}

export interface Icon {
  iconType: string;
}

export interface MenuNavigationItemRendererNavigationEndpoint {
  clickTrackingParams: string;
  watchEndpoint?: WatchEndpoint;
  addToPlaylistEndpoint?: AddToPlaylistEndpoint;
  browseEndpoint?: BrowseEndpoint;
  shareEntityEndpoint?: ShareEntityEndpoint;
}

export interface AddToPlaylistEndpoint {
  videoId: string;
}

export interface ShareEntityEndpoint {
  serializedShareEntity: string;
  sharePanelType: string;
}

export interface MenuServiceItemRenderer {
  text: LongBylineText;
  icon: Icon;
  serviceEndpoint: ServiceEndpoint;
  trackingParams: string;
}

export interface ServiceEndpoint {
  clickTrackingParams: string;
  queueAddEndpoint?: QueueAddEndpoint;
  removeFromQueueEndpoint?: RemoveFromQueueEndpoint;
  getReportFormEndpoint?: GetReportFormEndpoint;
  deletePlaylistEndpoint?: DeletePlaylistEndpoint;
}

export interface DeletePlaylistEndpoint {
  playlistId: string;
  command: Command;
}

export interface Command {
  clickTrackingParams: string;
  dismissQueueCommand: DismissQueueCommand;
}

export interface DismissQueueCommand {}

export interface GetReportFormEndpoint {
  params: string;
}

export interface QueueAddEndpoint {
  queueTarget: QueueTarget;
  queueInsertPosition: string;
  commands?: Command[];
}

export interface Command {
  clickTrackingParams: string;
  addToToastAction: AddToToastAction;
}

export interface AddToToastAction {
  item: AddToToastActionItem;
}

export interface AddToToastActionItem {
  notificationTextRenderer: NotificationTextRenderer;
}

export interface NotificationTextRenderer {
  successResponseText: LongBylineText;
  trackingParams: string;
}

export interface QueueTarget {
  videoId: string;
  onEmptyQueue?: OnEmptyQueue;
  backingQueuePlaylistId: string;
}

export interface OnEmptyQueue {
  clickTrackingParams: string;
  watchEndpoint: OnEmptyQueueWatchEndpoint;
}

export interface OnEmptyQueueWatchEndpoint {
  videoId: string;
}

export interface RemoveFromQueueEndpoint {
  videoId: string;
  commands: Command[];
  itemId: string;
}

export interface ToggleMenuServiceItemRenderer {
  defaultText: LongBylineText;
  defaultIcon: Icon;
  defaultServiceEndpoint: DefaultServiceEndpoint;
  toggledText: LongBylineText;
  toggledIcon: Icon;
  toggledServiceEndpoint: ToggledServiceEndpoint;
  trackingParams: string;
}

export interface DefaultServiceEndpoint {
  clickTrackingParams: string;
  feedbackEndpoint?: FeedbackEndpoint;
  likeEndpoint?: LikeEndpoint;
}

export interface FeedbackEndpoint {
  feedbackToken: string;
}

export interface LikeEndpoint {
  status: string;
  target: Target;
  removeLikeParams?: string;
  actions?: Action[];
  likeParams?: string;
}

export interface Action {
  clickTrackingParams: string;
  musicLibraryStatusUpdateCommand: MusicLibraryStatusUpdateCommand;
}

export interface MusicLibraryStatusUpdateCommand {
  libraryStatus: string;
  addToLibraryFeedbackToken: string;
}

export interface Target {
  videoId: string;
}

export interface ToggledServiceEndpoint {
  clickTrackingParams: string;
  feedbackEndpoint: FeedbackEndpoint;
  likeEndpoint?: LikeEndpoint;
}

export interface PlaylistPanelVideoRendererNavigationEndpoint {
  clickTrackingParams: string;
  watchEndpoint: WatchEndpoint;
}

export interface QueueNavigationEndpoint {
  clickTrackingParams: string;
  queueAddEndpoint: QueueAddEndpoint;
}

export interface Thumbnail {
  thumbnails: ThumbnailElement[];
}

export interface ThumbnailElement {
  url: string;
  width: number;
  height: number;
}

export interface Title {
  runs: Run[];
}