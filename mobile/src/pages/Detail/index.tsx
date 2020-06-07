import React, {useState, useEffect} from 'react';
import { FontAwesome as Icon, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, TouchableOpacity, Text, Image, SafeAreaView, Linking} from 'react-native';
import { RectButton } from 'react-native-gesture-handler'
import api from '../../services/api';
import * as MailComposer from 'expo-mail-composer';

import styles from './styles';

interface Params {
    point_id: number
}

interface Data {
    point: {
        image:string,
        image_url:string, 
        name:string,
        email: string,
        whatsapp: string,
        city:string,
        uf:string
    },
    items: {
        title: string
    }[]
}

const Detail = () => {

    const [data, setData] = useState<Data>({} as Data);

    const route = useRoute();
    const navigation = useNavigation();

    const routeParams = route.params as Params;

    useEffect(() => {
        api.get(`points/${routeParams.point_id}`).then(response => {
            setData(response.data);
        });
    }, []);

    function handleNavigateGoBack() {
        navigation.goBack()
    }

    function handleComposeMail() {
        MailComposer.composeAsync({
            subject: 'Interesse na coleta de resíduos',
            recipients: [data.point.email]
        });
    }

    function handleWhatsapp() {
        Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Tenho interesse sobre a coleta de resíduos`);
    }

    if (!data.point) {
        return null;
    }

    return(
        <SafeAreaView style={{flex: 1, paddingTop: 32}}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateGoBack}>
                    <Feather name="arrow-left" size={24} color="#34cb79"/>
                </TouchableOpacity>

                <Image style={styles.pointImage} source={{uri: data.point.image_url}} />
                <Text style={styles.pointName}>{data.point.name}</Text>
                <Text style={styles.pointItems}>
                    {data.items.map(item=> item.title).join(', ')}
                </Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{data.point.city}, {data.point.uf}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={handleWhatsapp}>
                    <Icon name="whatsapp" color="#fff" size={20} />
                    <Text style={styles.buttonText}>Whastapp</Text>
                </RectButton>

                <RectButton style={styles.button} onPress={handleComposeMail}>
                    <Feather name="mail" color="#fff" size={20} />
                    <Text style={styles.buttonText}>Email</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    )
};

export default Detail;