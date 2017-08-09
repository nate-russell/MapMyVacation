from imgurpython import ImgurClient
import yaml, os
import string


def get_client_keys(loc='..\\keys\\keys.yaml'):
    assert os.path.isfile(loc)
    client_dict = yaml.load(open(loc, mode='r'))
    return client_dict


if __name__ == '__main__':

    client_dict = get_client_keys()
    print(client_dict)
    # If you already have an access/refresh pair in hand
    client_id = client_dict['client_id']
    client_secret = client_dict['client_secret']
    refresh_token = client_dict['refresh_token']

    # Note since access tokens expire after an hour, only the refresh token is required (library handles autorefresh)
    client = ImgurClient(client_id, client_secret, refresh_token)

    big = open('..\\data\\bigcontent.html', mode='w')
    slider = open('..\\data\\slidercontent.html', mode='w')

    for i, album in enumerate(client.get_account_albums('NateRussell1')):
        album_title = album.title if album.title else 'Untitled'
        print('Album: {0} ({1})'.format(album_title, album.id))

        for j, image in enumerate(client.get_album_images(album.id)):
            image_title = image.title if image.title else 'Untitled'
            image_link = image.link[0:4] + 's' + image.link[4:]
            big_image_link = image_link[:-4] + 'h' + image_link[-4:]
            small_image_link = image_link[:-4] + 's' + image_link[-4:]
            print('\t{0}: {1}'.format(big_image_link, small_image_link))

            big.write(
                '<a class="%s"><img data-lazy="%s" class="bimg %s"/></a>' % (album.id, big_image_link, album.id))
            slider.write(
                '<a class="%s"><img data-lazy="%s" class="simg %s"/></a>' % (album.id, small_image_link, album.id))

    big.close()
    slider.close()
