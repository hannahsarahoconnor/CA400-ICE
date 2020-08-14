import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import 'react-native-gesture-handler';

import RegistrationScreen from '../screens/RegistrationScreen';
import VerifyUserScreen from '../screens/VerifyUserScreen';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import SafeZoneAdd from '../screens/SafeZoneAdd';
import SafeZoneSetup from '../screens/SafeZoneSetup';
import MedicalProfileSetup from '../screens/MedicalProfileSetup';
import NotificationFeedScreen from '../screens/NotificationFeedScreen';
import RequestsScreen from '../screens/RequestsScreen';
import CircleSetup from '../screens/CircleSetup';
import CircleCreate from '../screens/CircleCreate';
import CircleJoin from '../screens/CircleJoin';
import SafeWordCreate from '../screens/SafeWordCreate';
import GroupChatScreen from '../screens/GroupChatScreen';
import SOSmode from '../screens/SOSmode';
import SOSActivated from '../screens/SOS-Activated';
import FollowMe from '../screens/FollowMe';
import FollowMeRouteMap from '../screens/FollowMeRouteMap';
import FollowMeTrackMap from '../screens/FollowMeTrackMap';
import CircleManager from '../screens/CircleManager';
import CircleMap from '../screens/CircleMap';
import IndividualChatScreen from '../screens/IndividualChatScreen';
import SMS from '../screens/112';
import TextFormat from '../screens/112TextScreen';
import Settings from '../screens/Settings';
import FakeCall from '../screens/FakeCall';
import SocialMedia from '../screens/SocialMedia';
import AddPost from '../screens/AddPost';
import AnswerCall from '../screens/AnswerCall'
import CallAnswered from '../screens/CallAnswered'
import ActivityLogScreen from '../screens/ActivityLogScreen'
import SOSLogs from '../screens/SOSLogs'
import FollowMeLogs from '../screens/FollowMeLogs'
import MessageListener from '../screens/MessageListener';
import ContactUsScreen from '../screens/ContactUsScreen';
import Comments from '../screens/Comments';
import PostSettings from '../screens/PostSettings';
import SafeZoneManager from '../screens/SafeZoneManager';

//add stack order of pages visted
const screens =
    {
    SplashScreen: {
      screen: SplashScreen,
      navigationOptions: {
        headerShown: false
      },
      // creating dynamic link for new members joining
      path: 'join'
    },
    HomeScreen: {
      screen: HomeScreen,
      navigationOptions:{
        headerShown: false
      },
    },
    ProfileSetupScreen: {
      screen: ProfileSetupScreen,
      navigationOptions: {
        headerShown: false
      },
    },
    NotificationFeedScreen: {
      screen: NotificationFeedScreen,
      navigationOptions: {
        headerShown: false
      },
    },
    Settings: {
      screen: Settings,
      navigationOptions: {
        headerShown: false
      },
    },
    SOSmode: {
      screen: SOSmode,
      navigationOptions: {
        headerShown: false
      },
    
    },
    FakeCall: {
      screen: FakeCall,
      navigationOptions: {
        headerShown: false
      },
    },
    AnswerCall: {
      screen: AnswerCall,
      navigationOptions: {
        headerShown: false
      },
    
    },
    CallAnswered: {
      screen: CallAnswered,
      navigationOptions: {
        headerShown: false
      },
    
    },
    SOSActivated: {
      screen: SOSActivated,
      navigationOptions: {
        headerShown: false
      },
    },
    SMS: {
      screen: SMS,
      navigationOptions: {
        headerShown: false
      },

    },
    TextFormat: {
      screen: TextFormat,
      navigationOptions: {
        headerShown: false
      },

    },
    WelcomeScreen: {
      screen: WelcomeScreen,
      navigationOptions: {
        headerShown: false
      },
    },
    TermsOfUseScreen: {
       screen: TermsOfUseScreen,
       navigationOptions: {
        headerBackTitle: null,
        headerBackTitleVisible:false,
      },
    },
    RegistrationScreen: {
      screen: RegistrationScreen,
      navigationOptions: {
        headerShown: false
      },
    },
    VerifyUserScreen: {
      screen: VerifyUserScreen,
      navigationOptions: {
        headerShown: false
      },
    },
    HomeScreen: {
        screen: HomeScreen,
        navigationOptions: {
          headerShown: false
        },
      },
      SafeZoneSetup: {
        screen: SafeZoneSetup,
        navigationOptions: {
          headerShown: false
        },
      },
      SafeZoneAdd: {
        screen: SafeZoneAdd,
        navigationOptions: {
          headerShown: false
        },
      },
      CircleSetup :{
        screen: CircleSetup,
        navigationOptions: {
          headerShown: false
        },
       },
     CircleCreate :{
      screen: CircleCreate,
      navigationOptions: {
        headerShown: false
      },
     },
     CircleJoin :{
      screen: CircleJoin,
      navigationOptions: {
        headerShown: false
      },
     },
     SafeWordCreate :{
      screen: SafeWordCreate,
      navigationOptions: {
        headerShown: false
      },
     },
    MedicalProfileSetup: {
        screen: MedicalProfileSetup,
        navigationOptions: {
          headerShown: false
        },
      },
     FollowMe: {
        screen: FollowMe,
        navigationOptions: {
          headerShown: false
        },
     },
     FollowMeTrackMap :{
      screen: FollowMeTrackMap,
      navigationOptions: {
        headerShown: false
      },
     },
     FollowMeRouteMap: {
      screen: FollowMeRouteMap,
      navigationOptions: {
        headerShown: false
      },
    },
    GroupChatScreen :{
        screen: GroupChatScreen,
        navigationOptions: {
          headerShown: false
        },
       },
       IndividualChatScreen :{
        screen: IndividualChatScreen,
        navigationOptions: {
          headerShown: false
        },
       },
      CircleMap: {
        screen: CircleMap,
        navigationOptions: {
          headerShown: false
        },
      },
      CircleManager: {
        screen: CircleManager,
        navigationOptions: {
          headerShown: false
        },
       },
      NotificationFeedScreen: {
        screen: NotificationFeedScreen,
        navigationOptions: {
          headerShown: false
        },
      },
      RequestsScreen: {
        screen:  RequestsScreen,
        navigationOptions: {
          headerShown: false
        },
      },
      UserProfileScreen: {
        screen:  UserProfileScreen,
        navigationOptions: {
          headerShown: false
        },
      },
      SocialMedia: {
        screen: SocialMedia,
        navigationOptions: {
          headerShown: false
        },
      },
      ActivityLogScreen: {
        screen:  ActivityLogScreen,
        navigationOptions: {
          headerShown: false
        },
      },
      AddPost: {
        screen: AddPost,
        navigationOptions: {
          headerShown: false
        },
      },
      Comments: {
        screen: Comments,
        navigationOptions: {
          headerShown: false
        },
      },

      FollowMeLogs: {
        screen:  FollowMeLogs,
        navigationOptions: {
          headerShown: false
        },
      },
      SOSLogs: {
        screen:  SOSLogs,
        navigationOptions: {
          headerShown: false
        },
      },
      MessageListener: {
        screen:  MessageListener,
        navigationOptions: {
          headerShown: false
        },
      },    
      ContactUsScreen: {
        screen:  ContactUsScreen,
        navigationOptions: {
          headerShown: false
        },
      },   
      PostSettings: {
        screen:  PostSettings,
        navigationOptions: {
          headerShown: false
        },
      },
      SafeZoneManager: {
        screen:  SafeZoneManager,
        navigationOptions: {
          headerShown: false
        },
      },
}
   
  const StackNav = createStackNavigator(screens, {
     initialRouteName: 'HomeScreen',
  });

export default createAppContainer(StackNav);
